import React, { useMemo, useState } from 'react';
import {
  FileObject,
  ParsedTvMetadata,
  ProcessedMatch,
  RenameSettings,
} from './types';
import { TvShowTile } from './TvShowTile';
import { buildRenamingList, compareFileToOptions } from './helpers';
import { orderBy } from 'lodash';
import { ProgressBar } from '../../core-ui/ProgressBar/ProgressBar';
import { ListSelectionControls } from '../../core-ui/ListSelectionControls/ListSelectionControls';
import { CACHE_KEY, CACHE_KEY_FILES } from './constants';
import { TvShowInput } from './TvShowInput';
import { Histogram } from '../../core-ui/Histogram/Histogram';
import { TvShowFilterState } from './TvShowFilters/types';
import { TvShowFilters } from './TvShowFilters/TvShowFilters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { ipcOnce } from '../../core-ui/ipc/helpers';
import { Channel } from '../../../common/channel';
import { RenameReport } from '../../../common/types';
import { RenameReportModal } from '../home/RenameReportModal/RenameReportModal';
import { TvRenameSettings } from './TvRenameSettings/TvRenameSettings';

export const TvShows: React.FC = () => {
  const [episodeData, setEpisodeData] = useState(
    localStorage.getItem(CACHE_KEY) || ''
  );
  const [fileObjects, setFileObjects] = useState<FileObject[]>(
    JSON.parse(localStorage.getItem(CACHE_KEY_FILES) || '[]') ?? []
  );
  const [selection, setSelection] = useState<string[]>([]);
  const [processedObjects, setProcessedObjects] = useState<ProcessedMatch[][]>(
    []
  );
  const [sortCol, setSortCol] = useState<
    [((val: ProcessedMatch[]) => string)[], ('asc' | 'desc')[]]
  >([[([match]) => match.newFilename], ['asc']]);
  const [filters, setFilters] = useState<TvShowFilterState>({});
  const [overrides, setOverrides] = useState<Record<string, ProcessedMatch>>(
    {}
  );
  const [renameSettings, setRenameSettings] = useState<RenameSettings>({});
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameReport, setRenameReport] = useState<RenameReport>();
  const parsed: ParsedTvMetadata[] = useMemo(() => {
    try {
      const parsedData = JSON.parse(episodeData || '[]');
      if (!Array.isArray(parsedData)) {
        throw new Error('not an array');
      }
      const filterFn = (obj: any) =>
        !obj.tag ||
        typeof obj.tag !== 'string' ||
        !obj.name ||
        typeof obj.name !== 'string';
      if (parsedData.some(filterFn)) {
        console.log({ invalid: parsedData.filter(filterFn) });
        throw new Error('Incorrect format');
      }
      const remapped = parsedData.map(({ name, tag }) => {
        const matches = tag.match(/(S(\d+)E(\d+)|Special\s+(\d+)x(\d+))/i);
        if (matches) {
          const [
            ,
            ,
            seasonNumber,
            episodeNumber,
            specialSeasonNumber,
            specialEpisodeNumber,
          ] = matches;
          return {
            name,
            tag,
            seasonNumber: +(seasonNumber ?? specialSeasonNumber),
            episodeNumber: +(episodeNumber ?? specialEpisodeNumber),
          };
        }
        console.error("Couldn't match season tag", { tag, name });
        return { name, tag };
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(remapped));
      return remapped;
    } catch (e) {
      console.error('error while parsing episode data', e);
      return [];
    }
  }, [episodeData]);
  const selectionSet = useMemo(() => new Set(selection), [selection]);
  const displayList = useMemo(() => {
    if (processedObjects.length === fileObjects.length) {
      return orderBy(
        processedObjects.filter((list) => {
          let valid = true;
          if (filters.text) {
            valid =
              valid &&
              [
                list[0].file.filename,
                list[0].newFilename,
                list[0].newFolderName,
              ].some((str) =>
                str.toLowerCase().includes(filters.text.toLowerCase())
              );
          }
          if (filters.maxDiffPercent !== undefined) {
            valid =
              valid &&
              Math.round(
                (list[0].distance / list[0].file.filename.length) * 100
              ) <= filters.maxDiffPercent;
          }
          if (filters.minDiffPercent !== undefined) {
            valid =
              valid &&
              Math.round(
                (list[0].distance / list[0].file.filename.length) * 100
              ) >= filters.minDiffPercent;
          }
          if (filters.excludePerfectMatches) {
            valid = valid && list[0].distance > 0;
          }
          if (filters.onlyChangedTags !== undefined) {
            valid = valid && list[0].tagChanged === filters.onlyChangedTags;
          }
          return valid;
        }),
        ...sortCol
      );
    } else {
      return processedObjects;
    }
  }, [processedObjects, sortCol, filters]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        padding: '1em',
      }}
    >
      <TvShowInput
        episodeData={episodeData}
        setEpisodeData={(val) => {
          setEpisodeData(val);
          setProcessedObjects([]);
          setSelection([]);
        }}
        parsedData={parsed}
        fileObjects={fileObjects}
        setFileObjects={(val) => {
          setFileObjects(val);
          setProcessedObjects([]);
          setSelection([]);
        }}
      />
      <div className="d-flex" style={{ gap: '.5em' }}>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (parsed.length > 0 && fileObjects.length > 0) {
              if (
                processedObjects.length > 0 &&
                !confirm(
                  'Are you sure you want to re-process? This will clear your current selection'
                )
              ) {
                return;
              }
              setProcessedObjects([]);
              setSelection([]);
              fileObjects.forEach((file) => {
                setTimeout(() => {
                  const ext = file.filename.substring(
                    file.filename.lastIndexOf('.') + 1
                  );
                  setProcessedObjects((prevState) =>
                    prevState.concat([
                      compareFileToOptions(parsed, file, ext, renameSettings),
                    ])
                  );
                }, 10);
              });
            }
          }}
        >
          Process
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            setSortCol([
              [([match]) => match.newFilename],
              [sortCol[1][0] === 'asc' ? 'desc' : 'asc'],
            ]);
          }}
        >
          Toggle Sort Order
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setRenameLoading(true);
            ipcOnce(
              Channel.RenameMovies,
              buildRenamingList(processedObjects, selectionSet, overrides)
            ).then((report) => {
              setRenameReport(report);
              setRenameLoading(false);
              console.log(report);
            });
          }}
          disabled={renameLoading || !!renameReport || selection.length === 0}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          Rename Files
        </button>
      </div>
      {fileObjects.length > 0 && (
        <ProgressBar
          value={processedObjects.length}
          max={fileObjects.length}
          showMax
        />
      )}
      <TvRenameSettings
        renameSettings={renameSettings}
        setRenameSettings={setRenameSettings}
      />
      <div className="card p-3 d-flex flex-column" style={{ gap: '.5em' }}>
        <Histogram
          dataset={processedObjects}
          calcScore={(object) =>
            (object[0].distance / object[0].file.filename.length) * 100
          }
          numBuckets={20}
          header="Match Strength Distribution"
          maxValue={100}
        />
      </div>
      <TvShowFilters filters={filters} setFilters={setFilters} />
      <ListSelectionControls
        sourceList={processedObjects.map((obj) => obj[0].file.filename)}
        filteredList={displayList.map((obj) => obj[0].file.filename)}
        selectedList={selection}
        onSelectionChanged={(newSelection) => setSelection(newSelection)}
      />
      <div
        style={{
          display: 'grid',
          gap: '.5em',
          gridTemplateColumns: 'repeat(auto-fit,30em)',
        }}
      >
        {displayList.map((list) => (
          <TvShowTile
            key={list[0].file.filename}
            processedEpisodes={list}
            selected={selectionSet.has(list[0].file.filename)}
            setSelected={(val) => {
              const filename = list[0].file.filename;
              if (val) {
                selectionSet.add(filename);
              } else {
                selectionSet.delete(filename);
              }
              setSelection([...selectionSet.values()]);
            }}
            overrides={overrides}
            setOverrides={setOverrides}
          />
        ))}
      </div>
      <RenameReportModal
        report={renameReport}
        loading={renameLoading}
        onDismiss={() => setRenameReport(undefined)}
      />
    </div>
  );
};
