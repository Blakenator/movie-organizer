import React, { useState } from 'react';
import { ParsedTvMetadata, ProcessedMatch, RenameSettings } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { compareFileToOptions } from './helpers';

interface TvShowTileProps {
  processedEpisodes: ProcessedMatch[];
  selected: boolean;
  setSelected: (val: boolean) => void;
  overrides: Record<string, ProcessedMatch>;
  setOverrides: (newOverrides: Record<string, ProcessedMatch>) => void;
  renameSettings: RenameSettings;
  parsedEpisodeData: ParsedTvMetadata[];
}

export const TvShowTile: React.FC<TvShowTileProps> = ({
  processedEpisodes,
  selected,
  setSelected,
  setOverrides,
  overrides,
  renameSettings,
  parsedEpisodeData,
}) => {
  const bestMatch =
    processedEpisodes[0].distance / processedEpisodes[0].file.filename.length;
  const [collapsed, setCollapsed] = useState(bestMatch < 0.25);
  const [showRefineOptions, setShowRefineOptions] = useState(false);
  const [directSearch, setDirectSearch] = useState('');
  const [reprocessFilename, setReprocessFilename] = useState(
    processedEpisodes[0].file.filename
  );
  const [refinedList, setRefinedList] = useState<ProcessedMatch[]>();
  const performRefinement = () => {
    const newSearch = compareFileToOptions(
      parsedEpisodeData,
      reprocessFilename
        ? { ...processedEpisodes[0].file, filename: reprocessFilename }
        : processedEpisodes[0].file,
      renameSettings,
      true
    ).map((match) => ({
      ...match,
      file: { ...match.file, filename: processedEpisodes[0].file.filename },
    }));
    setRefinedList(
      (directSearch
        ? newSearch.filter((result) =>
            [result.episode.name, result.episode.tag].some((val) =>
              val.toLowerCase().includes(directSearch.toLowerCase())
            )
          )
        : newSearch
      ).slice(0, 20)
    );
  };

  return (
    <div
      className={`card p-2 ${selected ? 'border-info' : ''}`}
      style={{
        gap: '.5em',
        borderWidth: '2px',
        backgroundColor:
          bestMatch < 0.1
            ? undefined
            : bestMatch < 0.25
            ? 'rgba(255,191,0,0.35)'
            : 'rgba(255,89,0,0.35)',
      }}
    >
      {!collapsed && (
        <div
          className="d-flex flex-column"
          style={{ gap: '.5em' }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {showRefineOptions && (
            <>
              <label className="d-flex flex-column" style={{ gap: '.5em' }}>
                <span>Direct Episode Search</span>
                <input
                  className="form-control"
                  style={{ width: '20em' }}
                  value={directSearch}
                  onChange={(event) => setDirectSearch(event.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      performRefinement();
                    }
                  }}
                />
              </label>
              <label className="d-flex flex-column" style={{ gap: '.5em' }}>
                <span>Change name and reprocess</span>
                <input
                  className="form-control"
                  style={{ width: '20em' }}
                  value={reprocessFilename}
                  onChange={(event) => setReprocessFilename(event.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      performRefinement();
                    }
                  }}
                />
              </label>
            </>
          )}
          <div className="d-flex" style={{ gap: '.5em' }}>
            <button
              className={`btn ${
                showRefineOptions &&
                overrides[processedEpisodes[0].file.filename]
                  ? 'btn-success'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => {
                setShowRefineOptions(!showRefineOptions);
                setRefinedList(undefined);
                if (overrides[processedEpisodes[0].file.filename]) {
                  setCollapsed(true);
                }
              }}
            >
              {showRefineOptions
                ? overrides[processedEpisodes[0].file.filename]
                  ? 'Close'
                  : 'Cancel'
                : 'Refine Search'}
            </button>
            {showRefineOptions && (
              <button
                className="btn btn-outline-secondary"
                onClick={performRefinement}
              >
                Search
              </button>
            )}
          </div>
        </div>
      )}
      {(collapsed
        ? [
            overrides[processedEpisodes[0].file.filename] ??
              processedEpisodes[0],
          ]
        : refinedList ?? processedEpisodes
      ).map((item, i) => {
        const {
          distance,
          episode,
          file,
          newFilename,
          prevNormFilename,
          rawDistance,
          newFolderName,
          tagChanged,
        } = item;
        const isSelected =
          selected &&
          (overrides[file.filename] ?? processedEpisodes[0]).newFilename ===
            newFilename;
        return (
          <div
            key={newFilename}
            className="card p-2"
            style={{
              gap: '.5em',
              backgroundColor: isSelected
                ? 'rgb(84,171,255)'
                : i > 0
                ? 'rgba(0,0,0,.1)'
                : undefined,
            }}
            onClick={() => {
              if (i === 0) {
                setCollapsed(!collapsed);
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5em' }}>
              <button
                className="btn btn-outline-secondary"
                onClick={(e) => {
                  setSelected(!isSelected);
                  setOverrides({
                    ...overrides,
                    [file.filename]: !isSelected ? item : undefined,
                  });
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FontAwesomeIcon
                  icon={isSelected ? faCheckCircle : faCircle}
                  className="text-info"
                  title="Toggle selection"
                />
              </button>
              <span style={{ flexGrow: 1 }}>
                {newFolderName}/{newFilename}
              </span>
              <span>
                {Math.round((rawDistance / file.filename.length) * 1000) / 10}%
              </span>
              <span>
                {Math.round((distance / file.filename.length) * 1000) / 10}%
              </span>
            </div>
            <hr />
            <span>Prev Filename: "{prevNormFilename}"</span>
            <span>Matched Episode: "{episode.name}"</span>
            {tagChanged && (
              <span className="badge bg-warning">Tag Changed</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
