import React, { useMemo, useState } from 'react';
import { RenameReport } from '../../../common/types';
import { Channel } from '../../../common/channel';
import { MovieList } from './MovieList/MovieList';
import { MovieFilters } from './MovieFilters/MovieFilters';
import { MovieFilterState } from './MovieFilters/types';
import { transformMoviePath } from '../../../common/helpers';
import { RenameReportModal } from './RenameReportModal/RenameReportModal';
import { Spinner } from 'react-bootstrap';
import { useBackend, useBackendMutation } from '../../core-ui';

export const Home: React.FC = () => {
  const [path, setPath] = useState(
    '/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Plug-in Support/Databases/com.plexapp.plugins.library.db'
  );
  const [filters, setFilters] = useState<MovieFilterState>({
    libraries: [],
    search: '',
  });
  const [renamePattern, setRenamePattern] = useState(
    '{title} ({year}) [{resolution}]'
  );
  const [selection, setSelection] = useState<Set<string>>(new Set([]));
  const [renameReport, setRenameReport] = useState<RenameReport>();
  const { data: db, refetch: fetchMovies } = useBackend({
    channel: Channel.OpenDb,
    props: { path },
  });
  const { data: movieList } = useBackend({
    channel: Channel.LoadMovies,
    skip: !db,
  });
  const [renameMovies, { loading: renameLoading }] = useBackendMutation({
    channel: Channel.RenameMovies,
  });
  const [restoreAddedAt] = useBackendMutation({
    channel: Channel.RestoreAddedAt,
  });

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
            renameMovies({
              transformedPaths: movieList
                .filter(({ id }) => selection.has(id))
                .map((movie) => transformMoviePath(movie, renamePattern)),
            }).then(({ content: report }) => {
              setRenameReport(report);
            });
          }}
          disabled={renameLoading || !!renameReport || selection.size === 0}
        >
          Rename {renameLoading && <Spinner animation="border" size="sm" />}
        </button>
        <button
          className="btn btn-danger me-2"
          onClick={() => {
            restoreAddedAt({ ids: Array.from(selection.values()) });
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
