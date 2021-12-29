import { Database, RunResult } from 'sqlite3';
import {
  PlexFile,
  PlexMovieMetadata,
  RenameReport,
  TransformedPaths,
} from '../common/types';
import { groupBy, sortBy, uniq, uniqBy } from 'lodash';
import * as fs from 'fs';
import * as path from 'path';

export class PlexIntegration {
  plexDb: Database;

  constructor(public path: string) {
    console.error('initializing plex integration with path:', path);
    this.plexDb = new Database(path);
    // this.plexDb.run('PRAGMA busy_timeout = 6000');
    // this.plexDb.configure('busyTimeout', 6000);
  }

  async loadMovies(): Promise<PlexFile<PlexMovieMetadata>[]> {
    return new Promise((resolve, reject) => {
      try {
        this.plexDb.all(
          `SELECT mi.id,
                  mi.title,
                  ls.name                    AS library,
                  sl.root_path               AS libraryPath,
                  mit.height                 AS resolution,
                  mi.originally_available_at AS airDate,
                  mp.file                    AS filepath,
                  ms.url                     AS subtitleFilepath
           FROM metadata_items mi
                  INNER JOIN media_items mit ON mit.metadata_item_id = mi.id
                  INNER JOIN media_parts mp ON mp.media_item_id = mit.id
                  LEFT JOIN media_streams ms ON ms.media_item_id = mit.id AND stream_type_id = 3 AND url LIKE 'file://%'
                  INNER JOIN library_sections ls ON mi.library_section_id = ls.id AND ls.section_type = 1
                  INNER JOIN section_locations sl ON sl.library_section_id = ls.id
           WHERE mi.remote IS NULL`,
          (err, results) => {
            const resultsById = groupBy(results, 'id');
            resolve(
              sortBy(
                Object.values(resultsById).map((deduped) => ({
                  id: deduped[0].id,
                  library: deduped[0].library,
                  libraryPath: deduped[0].libraryPath,
                  filepaths: uniq(
                    deduped
                      .map(({ filepath, subtitleFilepath }) =>
                        subtitleFilepath
                          ? [
                              filepath,
                              decodeURIComponent(
                                subtitleFilepath.replace('file://', '')
                              ),
                            ]
                          : [filepath]
                      )
                      .flat(3)
                  ),
                  metadata: {
                    title: deduped[0].title,
                    airDate: deduped[0].airDate,
                    resolution: deduped[0].resolution,
                  },
                })),
                'metadata.title'
              )
            );
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  swapLibForTestFolder(filename: string) {
    const TEST_MODE = false;
    return TEST_MODE
      ? filename.replace(
          '/mnt/shared_drive/plex/Movies',
          '/mnt/shared_drive/plex_testing/Movies'
        )
      : filename;
  }

  async renameMovies(
    transformedPaths: TransformedPaths[]
  ): Promise<RenameReport> {
    const report: RenameReport = {
      renamedIds: [],
      skippedCleanupPaths: [],
      skippedPaths: [],
      skippedIds: [],
    };
    transformedPaths.forEach(({ changed, oldPaths, newPaths, id }) => {
      if (changed) {
        oldPaths.forEach((oldpath, i) => {
          const newpath = this.swapLibForTestFolder(newPaths[i]);
          const oldpathsafe = this.swapLibForTestFolder(oldpath);
          const newParentDir = this.swapLibForTestFolder(path.dirname(newpath));
          const oldParentDir = this.swapLibForTestFolder(path.dirname(oldpath));

          // test if new dir exists
          if (!fs.existsSync(newParentDir)) {
            fs.mkdirSync(newParentDir, { recursive: true });
          }
          // test if new filename exists
          if (fs.existsSync(newpath)) {
            // skip this file
            console.log(
              'Skipping rename because "' + newpath + '" already exists'
            );
            report.skippedPaths.push({
              value: newpath,
              message: 'New filename already exists',
            });
            return;
          }
          // test if old filename exists
          if (!fs.existsSync(oldpathsafe)) {
            // skip this file
            console.log(
              'Skipping rename because "' +
                oldpathsafe +
                '"Old filename does not exist'
            );
            report.skippedPaths.push({ value: newpath, message: '' });
            return;
          }
          // rename file
          // skip this file
          console.log('Renaming file "' + newpath + '"...');
          fs.renameSync(oldpathsafe, newpath);
          report.renamedIds.push({
            value: id,
            message: 'Renamed successfully',
          });
          // test if old parent dir is empty
          if (fs.readdirSync(oldParentDir).length === 0) {
            // cleanup old dir if empty
            fs.rmdirSync(oldParentDir);
          } else {
            console.log(
              'Skipping old folder cleanup because "' +
                oldParentDir +
                '" is not empty'
            );
            report.skippedCleanupPaths.push({
              value: oldParentDir,
              message: 'Old directory is not empty',
            });
          }
        });
      } else {
        report.skippedIds.push({ value: id, message: 'No changes needed' });
      }
    });

    return Object.fromEntries(
      Object.entries(report).map(([key, value]) => [
        key,
        uniqBy(value, 'value'),
      ])
    ) as unknown as RenameReport;
  }

  async restoreAddedAtTimes(ids: string[]): Promise<boolean> {
    // drop the triggers that cause an error
    const recreateTriggersSql = await this.dropTriggers();

    const result: boolean = await new Promise((resolve, reject) => {
      try {
        const query = `
          UPDATE metadata_items
          SET added_at=mp_nested.updated_at FROM (
               SELECT MAX(mp.updated_at) AS updated_at,mit.metadata_item_id FROM media_items mit
                INNER JOIN media_parts mp
                       ON mp.media_item_id = mit.id GROUP BY mit.metadata_item_id 
                       ) AS mp_nested
          WHERE mp_nested.metadata_item_id = metadata_items.id AND metadata_items.id IN (${new Array(
            ids.length
          )
            .fill('?')
            .join(',')})`;
        this.plexDb.run(
          query,
          ids.map((id) => id.toString()),
          (err: any, results: RunResult) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
    // recreate the triggers after this is done
    await this.recreateTriggers(recreateTriggersSql);
    return result;
  }

  async dropTriggers(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.plexDb.all(
          `SELECT name, SQL
           FROM sqlite_master
           WHERE TYPE ='trigger' AND tbl_name='metadata_items' AND NAME LIKE '%update%';`,
          [],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              const query = results
                .map(({ name }) => `DROP TRIGGER ${name};`)
                .join('\n');
              this.plexDb.run(query, [], (err: any, results2: RunResult) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results.map(({ sql }) => sql).join(';\n'));
                }
              });
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async recreateTriggers(triggerCreateSql: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.plexDb.run(triggerCreateSql, [], (err: any, result: RunResult) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
