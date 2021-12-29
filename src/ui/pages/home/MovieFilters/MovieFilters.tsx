import React, { useMemo } from 'react';
import { PlexFile, PlexMovieMetadata } from '../../../../common/types';
import { uniq } from 'lodash';
import { MovieFilterState } from './types';

interface MovieFiltersProps {
  movies?: PlexFile<PlexMovieMetadata>[];
  setFilters: (filters: MovieFilterState) => void;
  filters: MovieFilterState;
}

export const MovieFilters: React.FC<MovieFiltersProps> = ({
  movies,
  setFilters,
  filters,
}) => {
  const libraryOptions = useMemo(
    () => uniq(movies?.map(({ library }) => library) ?? []),
    [movies]
  );

  return (
    <div className="d-flex align-items-center">
      <input
        className="form-control m-2"
        value={filters.search}
        onChange={(event) =>
          setFilters({ ...filters, search: event.target.value })
        }
        placeholder="Search..."
      />
      <select
        className="form-select m-2"
        value={filters.libraries[0]}
        onChange={(event) =>
          setFilters({ ...filters, libraries: [event.target.value] })
        }
      >
        <option value="">Select Library</option>
        {libraryOptions.map((library) => (
          <option value={library} key={library}>
            {library}
          </option>
        ))}
      </select>
      <select
        className="form-select m-2"
        value={`${filters.withChanges}`}
        onChange={(event) =>
          setFilters({
            ...filters,
            withChanges:
              event.target.value === 'true'
                ? true
                : event.target.value === 'false'
                ? false
                : undefined,
          })
        }
      >
        <option value="undefined">Changed and Unchanged</option>
        <option value={'true'}>Only Changed</option>
        <option value={'false'}>Only Unchanged</option>
      </select>
      <select
        className="form-select m-2"
        value={`${filters.withConflicts}`}
        onChange={(event) =>
          setFilters({
            ...filters,
            withConflicts:
              event.target.value === 'true'
                ? true
                : event.target.value === 'false'
                ? false
                : undefined,
          })
        }
      >
        <option value="undefined">Conflicts and No Conflicts</option>
        <option value={'true'}>Only Conflicts</option>
        <option value={'false'}>Only No Conflicts</option>
      </select>
    </div>
  );
};
