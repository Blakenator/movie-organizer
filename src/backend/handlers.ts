// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
import { PlexIntegration } from './plexIntegration';
import { BackendPromiseApi, Channel } from '../common/channel';
import { shell } from 'electron';
import { BackendSyncHandlersType } from '@superflag/super-ipc/backend';

let plexIntegration: PlexIntegration;

export const BackendHandlers: BackendSyncHandlersType<
  Channel,
  BackendPromiseApi
> = {
  [Channel.OpenDb]: ({ args: { path } }) => {
    plexIntegration = new PlexIntegration(path);
    return true;
  },
  [Channel.LoadMovies]: () => plexIntegration.loadMovies(),
  [Channel.RenameMovies]: ({ args: { transformedPaths } }) =>
    plexIntegration.renameMovies(transformedPaths),
  [Channel.RestoreAddedAt]: ({ args: { ids } }) =>
    plexIntegration.restoreAddedAtTimes(ids),
  [Channel.ShowFolder]: ({ args: { path } }) => shell.showItemInFolder(path),
};
