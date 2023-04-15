import React, { useMemo, useState } from 'react';
import { FileObject, ParsedTvMetadata, ProcessedMatch } from './types';
import { TvShowTile } from './TvShowTile';
import { compareFileToOptions } from './helpers';
import { orderBy } from 'lodash';
import { ProgressBar } from '../../core-ui/ProgressBar/ProgressBar';
import { ListSelectionControls } from '../../core-ui/ListSelectionControls/ListSelectionControls';
import { CACHE_KEY, CACHE_KEY_FILES } from './constants';
import { TvShowInput } from './TvShowInput';
import { Histogram } from '../../core-ui/Histogram/Histogram';
import { TvShowFilterState } from './TvShowFilters/types';
import { TvShowFilters } from './TvShowFilters/TvShowFilters';

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
            seasonNumber: seasonNumber ?? specialSeasonNumber,
            episodeNumber: episodeNumber ?? specialEpisodeNumber,
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
              ) < filters.maxDiffPercent;
          }
          if (filters.minDiffPercent !== undefined) {
            valid =
              valid &&
              Math.round(
                (list[0].distance / list[0].file.filename.length) * 100
              ) > filters.minDiffPercent;
          }
          if (filters.excludePerfectMatches) {
            valid = valid && list[0].distance > 0;
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
        setEpisodeData={setEpisodeData}
        parsedData={parsed}
        fileObjects={fileObjects}
        setFileObjects={setFileObjects}
      />

      <button
        className="btn btn-danger"
        onClick={() => {
          if (parsed.length > 0 && fileObjects.length > 0) {
            setProcessedObjects([]);
            fileObjects.forEach((file) => {
              setTimeout(() => {
                const ext = file.filename.substring(
                  file.filename.lastIndexOf('.') + 1
                );
                setProcessedObjects((prevState) =>
                  prevState.concat([compareFileToOptions(parsed, file, ext)])
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
      {fileObjects.length > 0 && (
        <ProgressBar
          value={processedObjects.length}
          max={fileObjects.length}
          showMax
        />
      )}
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
          />
        ))}
      </div>
    </div>
  );
};
