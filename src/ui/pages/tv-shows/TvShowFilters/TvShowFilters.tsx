import React, { useCallback, useEffect, useState } from 'react';
import { TvShowFilterState } from './types';
import { debounce, isEqual } from 'lodash';

interface TvShowFiltersProps {
  filters: TvShowFilterState;
  setFilters: (val: TvShowFilterState) => void;
}

export const TvShowFilters: React.FC<TvShowFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const setFiltersDebounced = useCallback(debounce(setFilters, 200), [
    setFilters,
  ]);

  useEffect(() => {
    if (!isEqual(tempFilters, filters)) {
      setTempFilters(filters);
    }
  }, [filters]);
  useEffect(() => {
    if (!isEqual(tempFilters, filters)) {
      setFiltersDebounced(tempFilters);
    }
  }, [tempFilters]);

  return (
    <div
      className="d-flex align-items-center justify-content-between"
      style={{
        gap: '1em',
      }}
    >
      <input
        className="form-control"
        style={{ width: '10em' }}
        value={tempFilters.text}
        onChange={(event) =>
          setTempFilters({ ...tempFilters, text: event.target.value })
        }
        placeholder="Search..."
      />
      <div
        className="d-flex align-items-center"
        style={{ gap: '.5em', minWidth: '20em' }}
      >
        <span>Match Difference</span>
        <div
          className="align-items-center"
          style={{
            display: 'grid',
            gridTemplateColumns: '2em 1fr 2em',
            gridTemplateRows: '1fr 1fr',
            gap: '.5em',
          }}
        >
          <span>Max</span>
          <input
            type="range"
            value={tempFilters.maxDiffPercent ?? 100}
            onChange={(event) =>
              setTempFilters({
                ...tempFilters,
                maxDiffPercent: Math.max(
                  +event.target.value,
                  tempFilters.minDiffPercent ?? 0
                ),
              })
            }
            min={0}
            max={100}
            step={1}
          />
          <span>{tempFilters.maxDiffPercent ?? 100}%</span>
          <span>Min</span>
          <input
            type="range"
            style={{ direction: 'rtl' }}
            value={100 - (tempFilters.minDiffPercent ?? 0)}
            onChange={(event) =>
              setTempFilters({
                ...tempFilters,
                minDiffPercent: Math.min(
                  100 - +event.target.value,
                  tempFilters.maxDiffPercent ?? 100
                ),
              })
            }
            min={0}
            max={100}
            step={1}
          />
          <span>{tempFilters.minDiffPercent ?? 0}%</span>
        </div>
      </div>
      <label>
        <input
          className="me-2"
          type="checkbox"
          checked={tempFilters.excludePerfectMatches}
          onClick={() =>
            setTempFilters({
              ...tempFilters,
              excludePerfectMatches: !tempFilters.excludePerfectMatches,
            })
          }
        />
        Exclude Perfect Matches
      </label>
      <div className="d-flex" style={{ gap: '1em' }}>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setTempFilters({})}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
