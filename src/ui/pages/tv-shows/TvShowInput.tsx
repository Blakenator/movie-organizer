import React, { useState } from 'react';
import { FileObject, ParsedTvMetadata } from './types';
import { CACHE_KEY_FILES } from './constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';

interface TvShowInputProps {
  episodeData: string;
  setEpisodeData: (val: string) => void;
  parsedData: ParsedTvMetadata[];
  fileObjects: FileObject[];
  setFileObjects: (val: FileObject[]) => void;
}

const script = `
JSON.stringify(
  [...document.querySelectorAll('.list-group-item')].map((el) => ({
    tag: el.querySelector('.episode-label').textContent,
    name: el.querySelector('.list-group-item-heading a').textContent.trim(),
    description: el.querySelector('.list-group-item-text p').textContent.trim(),
  }))
)
`;

export const TvShowInput: React.FC<TvShowInputProps> = ({
  episodeData,
  setEpisodeData,
  parsedData,
  fileObjects,
  setFileObjects,
}) => {
  // react really doesn't like the webkitdirectory prop
  const fakeProps = { webkitdirectory: '' };
  const fileObjectsComplete = fileObjects.length > 0;
  const episodeDataComplete = !!episodeData;
  const [episodeDataCollapsed, setEpisodeDataCollapsed] =
    useState(episodeDataComplete);
  const [fileObjectsCollapsed, setFileObjectsCollapsed] =
    useState(fileObjectsComplete);

  const allStepsComplete = fileObjectsComplete && episodeDataComplete;
  return (
    <div
      className={`alert ${
        allStepsComplete ? 'alert-secondary' : 'alert-info'
      } d-flex flex-column`}
      style={{ gap: '1em' }}
    >
      <h4 className="d-flex align-items-center" style={{ gap: '1em' }}>
        <span>Required input</span>
        {allStepsComplete && (
          <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
        )}
      </h4>
      <div className="card">
        <div
          className="p-2 d-flex align-items-center"
          style={{ gap: '.5em', cursor: 'pointer' }}
          onClick={() => setEpisodeDataCollapsed(!episodeDataCollapsed)}
        >
          {fileObjectsComplete && (
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success"
              title="Toggle selection"
            />
          )}
          <span style={{ flexGrow: 1 }}>
            Scrape Episode Metadata ({parsedData?.length})
          </span>
          <FontAwesomeIcon
            icon={episodeDataCollapsed ? faChevronDown : faChevronUp}
          />
        </div>
        <div
          className={[
            'd-flex',
            'flex-column',
            'p-2',
            episodeDataCollapsed ? 'd-none' : '',
          ].join(' ')}
          style={{ gap: '1em' }}
        >
          <div>
            Go to <a href="www.thetvdb.com">The TvDB</a> and find the show you
            would like to compare against. Then navigate to the All Episodes
            page and run the following script. Copy the value of the console log
            and paste into the textarea below
          </div>
          <pre className="card p-2">{script}</pre>
          <div>Script output</div>
          <textarea
            className="form-control"
            value={episodeData}
            onChange={(event) => {
              setEpisodeData(event.target.value);
              setEpisodeDataCollapsed(true);
            }}
          />
          <div>Parsed {parsedData?.length} objects</div>
        </div>
      </div>
      <div className="card">
        <div
          className="p-2 d-flex align-items-center"
          style={{ gap: '.5em', cursor: 'pointer' }}
          onClick={() => setFileObjectsCollapsed(!fileObjectsCollapsed)}
        >
          {fileObjectsComplete && (
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success"
              title="Toggle selection"
            />
          )}
          <span style={{ flexGrow: 1 }}>
            Select Source Folder ({fileObjects?.length})
          </span>
          <FontAwesomeIcon
            icon={fileObjectsCollapsed ? faChevronDown : faChevronUp}
          />
        </div>
        <input
          type="file"
          className={fileObjectsCollapsed ? 'd-none' : ''}
          {...fakeProps}
          onChange={(event) => {
            const files = event.target.files;
            if (files.length > 0) {
              const parsedFileObjects = [...(files as any)].map(
                ({
                  webkitRelativePath: relativePath,
                  path,
                  name: filename,
                }) => ({
                  relativePath,
                  path,
                  filename,
                })
              );
              setFileObjects(parsedFileObjects);
              setFileObjectsCollapsed(true);
              localStorage.setItem(
                CACHE_KEY_FILES,
                JSON.stringify(parsedFileObjects)
              );
              event.target.value = null;
            } else {
              console.log('empty');
            }
          }}
        />
      </div>
    </div>
  );
};
