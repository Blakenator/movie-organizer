import {
  FileObject,
  ParsedTvMetadata,
  ProcessedMatch,
  RenameSettings,
} from './types';
import { orderBy } from 'lodash';
import { distance } from 'fastest-levenshtein';
import { transformPattern } from '../../../common/helpers';
import { TransformedPaths } from '../../../common/types';

export function compareFileToOptions(
  parsed: ParsedTvMetadata[],
  file: FileObject,
  ext: string,
  renameSettings: RenameSettings
): ProcessedMatch[] {
  return orderBy(
    parsed.map((ep) => {
      const filename = renameSettings.replaceInEpisodes?.trim()
        ? file.filename.replace(
            new RegExp(renameSettings.replaceInEpisodes, 'i'),
            ''
          )
        : file.filename;
      const prevNormFilename = filename
        .substring(0, filename.lastIndexOf('.'))
        .trim();
      const episodeName = ep.name.trim();
      const rawDistance = distance(
        prevNormFilename.trim().toLowerCase(),
        episodeName.toLowerCase()
      );
      const specialTag =
        ep.seasonNumber === 0
          ? 'S00E' + (ep.episodeNumber < 10 ? '0' : '') + ep.episodeNumber
          : undefined;
      const newFilename = transformPattern(
        renameSettings.fileTemplate || '{tag} - {name}.{ext}',
        {
          ...ep,
          name: episodeName.replace(/[~"#%&*:<>?/\\{|}]+/g, ''),
          ext: ext,
          ...(specialTag ? { tag: specialTag } : {}),
        }
      ).trim();
      const bestDistance = distance(
        prevNormFilename.toLowerCase(),
        newFilename
          .toLowerCase()
          .substring(0, newFilename.lastIndexOf('.'))
          .trim()
      );
      return {
        episode: ep,
        file,
        distance: bestDistance,
        prevNormFilename,
        newFilename,
        rawDistance: rawDistance,
        newFolderName: transformPattern(
          +ep.seasonNumber === 0
            ? 'Specials'
            : renameSettings.folderTemplate?.trim() || 'Season {seasonNumber}',
          { ...ep }
        ),
        tagChanged: !prevNormFilename.includes(specialTag ?? ep.tag),
      };
    }),
    ['distance', 'episode.tag'],
    ['asc', 'asc']
  ).slice(0, 5);
}

export function buildRenamingList(
  episodeMatches: ProcessedMatch[][],
  selectionSet: Set<string>,
  overrides: Record<string, ProcessedMatch>
): TransformedPaths[] {
  if (selectionSet.size === 0) {
    return [];
  }

  return episodeMatches
    .filter((list) => selectionSet.has(list[0].file.filename))
    .map((list) => {
      const override = overrides[list[0].file.filename];
      const match = override ?? list[0];
      const oldPath = match.file.path;
      const prevRoot = oldPath.substring(
        0,
        oldPath.lastIndexOf(
          match.file.relativePath.substring(
            match.file.relativePath.indexOf('/')
          )
        )
      );
      const newPath =
        prevRoot + '/' + match.newFolderName + '/' + match.newFilename;
      return {
        id: match.file.filename,
        oldPaths: [oldPath],
        newPaths: [newPath],
        changed: match.distance > 0 || oldPath !== newPath,
      };
    });
}
