import React, { useEffect, useMemo, useState } from 'react';
import {
  PlexFile,
  PlexMovieMetadata,
  RenameReport,
} from '../../../common/types';
import { Channel } from '../../../common/channel';
import { ipcOnce } from '../../core-ui/ipc/helpers';
import { MovieList } from './MovieList/MovieList';
import { MovieFilters } from './MovieFilters/MovieFilters';
import { MovieFilterState } from './MovieFilters/types';
import { transformMoviePath } from '../../../common/helpers';
import { RenameReportModal } from './RenameReportModal/RenameReportModal';
import { Spinner } from 'react-bootstrap';

export const Home: React.FC = () => {
  const [path, setPath] = useState(
    '/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Plug-in Support/Databases/com.plexapp.plugins.library.db'
  );
  const [movieList, setMovieList] = useState<PlexFile<PlexMovieMetadata>[]>();
  const [filters, setFilters] = useState<MovieFilterState>({
    libraries: [],
    search: '',
  });
  const [renamePattern, setRenamePattern] = useState(
    '{title} ({year}) [{resolution}]'
  );
  const [selection, setSelection] = useState<Set<string>>(new Set([]));
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameReport, setRenameReport] = useState<RenameReport>();

  async function fetchMovies() {
    try {
      setMovieList(await ipcOnce(Channel.LoadMovies));
    } catch (e) {
      console.error(e);
    }
  }

  const openAndLoadMovies = async () => {
    await ipcOnce(Channel.OpenDb, path);
    await fetchMovies();
  };

  useEffect(() => {
    if (path) {
      openAndLoadMovies();
    }
  }, [path]);
  const titlesById = useMemo(
    () =>
      Object.fromEntries(
        (movieList ?? []).map((movie) => [movie.id, movie.metadata.title])
      ),
    [movieList]
  );

  return (
    <>
      <input
        type="file"
        className="form-control"
        onChange={(event) =>
          setPath(
            event.target.files.length > 0
              ? event.target.files[0].path
              : undefined
          )
        }
      />
      {path && <span>Selected path: {path}</span>}
      <div className="card d-flex p-2 m-2 flex-row">
        <button className="btn btn-primary me-2" onClick={() => fetchMovies()}>
          Refresh Movies
        </button>
        <button
          className="btn btn-danger me-2"
          onClick={() => {
            setRenameLoading(true);
            ipcOnce(
              Channel.RenameMovies,
              movieList
                .filter(({ id }) => selection.has(id))
                .map((movie) => transformMoviePath(movie, renamePattern))
            ).then((report) => {
              setRenameReport(report);
              setRenameLoading(false);
            });
          }}
          disabled={renameLoading || !!renameReport || selection.size === 0}
        >
          Rename {renameLoading && <Spinner animation="border" size="sm" />}
        </button>
        <button
          className="btn btn-danger me-2"
          onClick={() => {
            ipcOnce(Channel.RestoreAddedAt, Array.from(selection.values()));
          }}
        >
          Restore Added At Times
        </button>
      </div>
      <div className="p-3">
        <div className="m-2 input-group" style={{ width: 'unset' }}>
          <div className="input-group-text">Rename Pattern</div>
          <input
            className="form-control"
            value={renamePattern}
            onChange={(event) => setRenamePattern(event.target.value)}
            placeholder="Rename Pattern"
          />
        </div>
        <MovieFilters
          movies={movieList}
          filters={filters}
          setFilters={setFilters}
        />
        <MovieList
          movies={movieList}
          renamePattern={renamePattern}
          filters={filters}
          selection={selection}
          setSelection={setSelection}
        />
      </div>
      <RenameReportModal
        report={renameReport}
        loading={renameLoading}
        titleById={titlesById}
        onDismiss={() => {
          setRenameReport(undefined);
          fetchMovies();
        }}
      />
    </>
  );
};
