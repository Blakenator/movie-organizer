import React, { useState } from 'react';
import { ProcessedMatch } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

interface TvShowTileProps {
  processedEpisodes: ProcessedMatch[];
  selected: boolean;
  setSelected: (val: boolean) => void;
}

export const TvShowTile: React.FC<TvShowTileProps> = ({
  processedEpisodes,
  selected,
  setSelected,
}) => {
  const bestMatch =
    processedEpisodes[0].distance / processedEpisodes[0].file.filename.length;
  const [collapsed, setCollapsed] = useState(bestMatch < 0.25);
  return (
    <div
      className="card p-2"
      style={{
        gap: '.5em',
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
        (
          {
            distance,
            episode,
            file,
            newFilename,
            prevNormFilename,
            rawDistance,
            newFolderName,
          },
          i
        ) => (
          <div
            className={['card', 'p-2', selected ? 'border-info' : ''].join(' ')}
            style={{
              gap: '.5em',
              backgroundColor: i > 0 ? 'rgba(0,0,0,.1)' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5em' }}>
              <FontAwesomeIcon
                icon={selected ? faCheckCircle : faCircle}
                className="text-info me-2"
                title="Toggle selection"
              />
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
            <span>Episode Name: "{episode.name}"</span>
            <span>Prev Filename: "{prevNormFilename}"</span>
          </div>
        )
      )}
    </div>
  );
};
