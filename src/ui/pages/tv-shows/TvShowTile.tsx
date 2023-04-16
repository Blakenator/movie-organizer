import React, { useState } from 'react';
import { ProcessedMatch } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

interface TvShowTileProps {
  processedEpisodes: ProcessedMatch[];
  selected: boolean;
  setSelected: (val: boolean) => void;
  overrides: Record<string, ProcessedMatch>;
  setOverrides: (newOverrides: Record<string, ProcessedMatch>) => void;
}

export const TvShowTile: React.FC<TvShowTileProps> = ({
  processedEpisodes,
  selected,
  setSelected,
  setOverrides,
  overrides,
}) => {
  const bestMatch =
    processedEpisodes[0].distance / processedEpisodes[0].file.filename.length;
  const [collapsed, setCollapsed] = useState(bestMatch < 0.25);
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
      onClick={() => setCollapsed(!collapsed)}
    >
      {(collapsed ? [processedEpisodes[0]] : processedEpisodes).map(
        (item, i) => {
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
            ((!overrides[file.filename] && i === 0) ||
              (overrides[file.filename]?.newFilename === newFilename && i > 0));
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
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '.5em' }}
              >
                <button
                  className="btn btn-outline-secondary"
                  onClick={(e) => {
                    setSelected(!isSelected);
                    setOverrides({
                      ...overrides,
                      [file.filename]: i > 0 ? item : undefined,
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
                  {Math.round((rawDistance / file.filename.length) * 1000) / 10}
                  %
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
        }
      )}
    </div>
  );
};
