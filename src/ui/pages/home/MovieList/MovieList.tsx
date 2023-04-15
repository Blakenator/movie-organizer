import React, { useEffect, useMemo, useState } from 'react';
import {
  PlexFile,
  PlexMovieMetadata,
  TransformedPaths,
} from '../../../../common/types';
import {
  getFancyResolution,
  transformMoviePath,
} from '../../../../common/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faCheckCircle,
  faExclamationTriangle,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import { MovieFilterState } from '../MovieFilters/types';
import { groupBy, keyBy, uniq } from 'lodash';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { ipcOnce } from '../../../core-ui/ipc/helpers';
import { Channel } from '../../../../common/channel';
import { ListSelectionControls } from '../../../core-ui/ListSelectionControls/ListSelectionControls';

interface MovieListProps {
  movies?: PlexFile<PlexMovieMetadata>[];
  filters: MovieFilterState;
  renamePattern: string;
  selection: Set<string>;
  setSelection: (selection: Set<string>) => void;
}

function getFilenameFromPath(path: string) {
  return path.substring(path.lastIndexOf('/') + 1);
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  renamePattern,
  filters,
  selection,
  setSelection,
}) => {
  const moviesById = useMemo(() => keyBy(movies ?? [], 'id'), [movies]);
  const [selectionStart, setSelectionStart] = useState<number>();

  function selectionUpdated() {
    setSelection(new Set(selection));
  }

  const transformedPathsById = useMemo(() => {
    const result: Record<string, TransformedPaths> = {};
    if (movies) {
      movies.forEach((movie) => {
        result[movie.id] = transformMoviePath(movie, renamePattern);
      });
    }
    return result;
  }, [movies, renamePattern]);
  const conflictsById = useMemo(() => {
    const result: Record<
      string,
      {
        id: string;
        internalConflicts: boolean;
        externalConflicts: { id: string; path: string }[];
      }
    > = {};
    if (movies) {
      const moviePathPairs = movies.flatMap(({ id }) =>
        uniq(transformedPathsById[id].newPaths).map((path) => ({ id, path }))
      );
      const groupedPathPairs = groupBy(moviePathPairs, 'path');
      movies.forEach((movie) => {
        result[movie.id] = {
          id: movie.id,
          internalConflicts:
            uniq(transformedPathsById[movie.id].newPaths).length !==
            movie.filepaths.length,
          externalConflicts: transformedPathsById[movie.id].newPaths.flatMap(
            (path) => groupedPathPairs[path].filter(({ id }) => id !== movie.id)
          ),
        };
      });
    }
    return result;
  }, [movies, renamePattern]);
  const [filteredMovies, setFilteredMovies] =
    useState<PlexFile<PlexMovieMetadata>[]>();

  useEffect(() => {
    setFilteredMovies(
      movies?.filter(
        ({ library, metadata, id }) =>
          (!filters.search ||
            metadata.title
              .toLowerCase()
              .includes(filters.search.toLowerCase())) &&
          (filters.libraries.length === 0 ||
            filters.libraries.includes(library)) &&
          (filters.withChanges === undefined ||
            filters.withChanges === transformedPathsById[id].changed) &&
          (filters.withConflicts === undefined ||
            filters.withConflicts ===
              (conflictsById[id]?.internalConflicts ||
                conflictsById[id]?.externalConflicts.length > 0))
      )
    );
    setSelectionStart(undefined);
  }, [
    movies,
    filters.search,
    filters.withChanges,
    filters.libraries,
    filters.withConflicts,
  ]);

  return filteredMovies ? (
    <div className="d-flex flex-column">
      <ListSelectionControls
        sourceList={movies.map(({ id }) => id)}
        filteredList={filteredMovies.map(({ id }) => id)}
        selectedList={[...selection]}
        onSelectionChanged={(newSelection) =>
          setSelection(new Set(newSelection))
        }
      />
      <div
        className="d-grid"
        style={{ gridTemplateColumns: 'repeat(4, minmax(10em,1fr))' }}
      >
        {filteredMovies.map(
          ({ id, metadata: { title, resolution, airDate }, library }, i) => (
            <div className="card m-1" key={id}>
              <div className="card-body">
                <div
                  className="card-title"
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => {
                    if (event.shiftKey) {
                      // disable text selection when using shift+click
                      document.getSelection().removeAllRanges();
                      if (selectionStart !== undefined) {
                        filteredMovies
                          .slice(
                            selectionStart > i ? i : selectionStart,
                            selectionStart > i ? selectionStart + 1 : i + 1
                          )
                          .forEach(({ id }) => selection.add(id));
                        setSelectionStart(i);
                        selectionUpdated();
                        return;
                      }
                    }
                    if (selection.has(id)) {
                      selection.delete(id);
                    } else {
                      selection.add(id);
                      setSelectionStart(i);
                    }
                    selectionUpdated();
                  }}
                >
                  <FontAwesomeIcon
                    icon={selection.has(id) ? faCheckCircle : faCircle}
                    className="text-info me-2"
                    title="Toggle selection"
                  />
                  <span>{title}</span>
                </div>
                {transformedPathsById[id]?.oldPaths.map((path, i) => (
                  <small className="card p-1 m-1" key={path}>
                    <div className="small" title={path}>
                      {getFilenameFromPath(path)}
                      <button
                        className="btn btn-sm btn-link ms-2"
                        onClick={() => ipcOnce(Channel.ShowFolder, path)}
                        title="Show in folder"
                      >
                        <FontAwesomeIcon icon={faFolderOpen} />
                      </button>
                    </div>
                    {transformedPathsById[id].changed &&
                      transformedPathsById[id].newPaths[i] !== path && (
                        <>
                          <FontAwesomeIcon icon={faArrowDown} />
                          <div
                            className="small"
                            title={transformedPathsById[id].newPaths[i]}
                          >
                            {getFilenameFromPath(
                              transformedPathsById[id].newPaths[i]
                            )}
                          </div>
                          <span className="badge bg-danger">Changed</span>
                        </>
                      )}
                  </small>
                ))}
                {conflictsById[id]?.internalConflicts && (
                  <div className="alert alert-warning my-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> This item
                    has internal conflicts after the rename operation
                  </div>
                )}
                {conflictsById[id]?.externalConflicts.length > 0 && (
                  <div className="alert alert-warning my-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    This item has external conflicts after the rename operation
                    with the following movies:
                    <ul>
                      {conflictsById[id].externalConflicts.map(
                        ({ id, path }) => (
                          <li key={id}>
                            {moviesById[id].metadata.title} - {path}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-between card-footer">
                <span className="badge bg-info">
                  {getFancyResolution(resolution)}
                </span>
                <span className="badge bg-secondary">
                  {new Date(airDate).getFullYear()}
                </span>
                <span className="badge bg-warning">{library}</span>
              </div>
            </div>
          )
        )}
      </div>
      ;
    </div>
  ) : null;
};
