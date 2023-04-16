import React from 'react';
import { RenameSettings } from '../types';

interface TvRenameSettingsProps {
  renameSettings: RenameSettings;
  setRenameSettings: (val: RenameSettings) => void;
}

export const TvRenameSettings: React.FC<TvRenameSettingsProps> = ({
  renameSettings,
  setRenameSettings,
}) => {
  return (
    <div className="card p-3" style={{ gap: '1em' }}>
      <label className="d-flex flex-column" style={{ gap: '.5em' }}>
        <span>Filename Template</span>
        <input
          className="form-control"
          style={{ width: '20em' }}
          value={renameSettings.fileTemplate ?? '{tag} - {name}.{ext}'}
          onChange={(event) =>
            setRenameSettings({
              ...renameSettings,
              fileTemplate: event.target.value,
            })
          }
          placeholder="{tag} - {name}.{ext}"
        />
      </label>
      <label className="d-flex flex-column" style={{ gap: '.5em' }}>
        <span>Folder Name Template</span>
        <input
          className="form-control"
          style={{ width: '20em' }}
          value={renameSettings.folderTemplate ?? 'Season {seasonNumber}'}
          onChange={(event) =>
            setRenameSettings({
              ...renameSettings,
              folderTemplate: event.target.value,
            })
          }
          placeholder="Season {seasonNumber}"
        />
      </label>
      <label className="d-flex flex-column" style={{ gap: '.5em' }}>
        <span>Replace Text Before Match (Regex)</span>
        <input
          className="form-control"
          style={{ width: '20em' }}
          value={renameSettings.replaceInEpisodes}
          onChange={(event) =>
            setRenameSettings({
              ...renameSettings,
              replaceInEpisodes: event.target.value,
            })
          }
        />
      </label>
    </div>
  );
};
