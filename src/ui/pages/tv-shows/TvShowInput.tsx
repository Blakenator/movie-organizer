import React, { useState } from 'react';
import { FileObject, ParsedTvMetadata } from './types';
import { CACHE_KEY_FILES } from './constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { useBackendMutation } from '../../core-ui';
import { Channel } from '../../../common/channel';
import { toast } from 'react-toastify';
import { Tab, Tabs } from 'react-bootstrap';

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

const IMG_WIDTH = 70;

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
  const [scrapeTvDb, { loading: scrapeLoading }] = useBackendMutation({
    channel: Channel.LoadTvDbEpisodes,
  });
  const [selectedSlug, setSelectedSlug] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [searchTvDb, { data: searchResults, loading: searchLoading }] =
    useBackendMutation({
      channel: Channel.SearchTvDb,
      props: { searchText },
    });

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
              const parsedFileObjects = [...(files as any)].map((file) => {
                const { webkitRelativePath: relativePath, name: filename } =
                  file;
                return {
                  relativePath,
                  path: (window as any).electron.getPathForFile(file),
                  filename,
                };
              });
              setFileObjects(parsedFileObjects);
              setFileObjectsCollapsed(true);
              localStorage.setItem(
                CACHE_KEY_FILES,
                JSON.stringify(parsedFileObjects),
              );
              event.target.value = null;
            } else {
              console.log('empty');
            }
          }}
        />
      </div>
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
          <Tabs defaultActiveKey="auto">
            <Tab title="Search" eventKey="auto">
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <input
                    value={searchText}
                    placeholder="Search TvDb..."
                    className="form-control"
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyUp={(event) => {
                      if (event.key.toLowerCase() === 'enter') {
                        searchTvDb();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => searchTvDb()}
                    disabled={searchLoading || !searchText?.trim()}
                  >
                    Search
                  </button>
                </div>
                <div
                  className="d-flex flex-column gap-2 overflow-y-auto"
                  style={{ maxHeight: '20em' }}
                >
                  {searchResults && searchResults.length === 0 && (
                    <div className="my-4 mx-2">No results found</div>
                  )}
                  {searchResults?.map((show) => (
                    <div key={show.name + show.id} className="card">
                      <div
                        className={`card-body d-flex gap-2 ${selectedSlug === show.slug ? 'bg-info' : ''}`}
                      >
                        <div
                          style={{ width: IMG_WIDTH, minWidth: IMG_WIDTH }}
                          className="d-flex align-items-center"
                        >
                          {show.coverPhotoSrc && (
                            <img
                              className="mw-100 rounded-2"
                              src={show.coverPhotoSrc}
                            />
                          )}
                        </div>
                        <div className="d-flex flex-column gap-2 flex-grow-1">
                          <h2>{show.name}</h2>
                          <div className="text-muted">{show.releaseYear}</div>
                          <div>{show.description}</div>
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                          <button
                            className="btn btn-outline-primary"
                            disabled={scrapeLoading}
                            onClick={async () => {
                              setSelectedSlug(show.slug);
                              scrapeTvDb({ slug: show.slug });
                              const res = await scrapeTvDb({ slug: show.slug });
                              if (res.error) {
                                toast.error(res.error.message);
                              } else {
                                setEpisodeData(JSON.stringify(res.data));
                                setEpisodeDataCollapsed(true);
                              }
                            }}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tab>
            <Tab title="Manual" eventKey="manual">
              <div>
                Go to <a href="www.thetvdb.com">The TvDB</a> and find the show
                you would like to compare against. Then navigate to the All
                Episodes page and run the following script. Copy the value of
                the console log and paste into the textarea below
              </div>
              <pre className="card p-2">{script}</pre>
              <div>Script output</div>
              <textarea
                className="form-control"
                value={episodeData}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setEpisodeData(newValue);
                  let valid;
                  try {
                    valid = JSON.parse(newValue)?.length > 0;
                  } catch (e) {
                    valid = false;
                  }
                  if (valid) {
                    setEpisodeDataCollapsed(true);
                  }
                }}
              />
              <div>Parsed {parsedData?.length} objects</div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
