import React, { ReactElement, useMemo } from 'react';
import { difference, uniq } from 'lodash';

interface ListSelectionControlsProps<T> {
  sourceList: T[];
  filteredList: T[];
  selectedList: T[];
  onSelectionChanged: (val: T[]) => void;
}

export const ListSelectionControls = <T,>({
  sourceList,
  filteredList,
  selectedList,
  onSelectionChanged,
}: ListSelectionControlsProps<T>): ReactElement => {
  const selectionSet = useMemo(() => new Set(selectedList), [selectedList]);

  return (
    <div
      className="mb-2 px-4 d-flex align-items-center"
      style={{ gap: '.5em' }}
    >
      <span className="text-muted">{sourceList.length} total</span>
      <span>-</span>
      <span className="text-muted">{filteredList.length} matches</span>
      <span>-</span>
      <span className="text-muted">{selectedList.length} selected</span>
      {selectedList.length === sourceList.length ? (
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            onSelectionChanged([]);
          }}
        >
          Deselect All
        </button>
      ) : (
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            onSelectionChanged(sourceList);
          }}
        >
          Select All
        </button>
      )}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => {
          onSelectionChanged(filteredList);
        }}
      >
        Select Only Visible
      </button>
      {filteredList.every((item) => selectionSet.has(item)) ? (
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            onSelectionChanged(difference(selectedList, filteredList));
          }}
        >
          Remove Visible from Selection
        </button>
      ) : (
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            onSelectionChanged(uniq(selectedList.concat(filteredList)));
          }}
        >
          Add Visible to Selection
        </button>
      )}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => {
          onSelectionChanged([]);
        }}
      >
        Clear Selection
      </button>
    </div>
  );
};
