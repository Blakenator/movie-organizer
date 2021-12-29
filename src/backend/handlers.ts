// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
import { PlexIntegration } from './plexIntegration';
import { createChannels } from './helpers';
import { Channel } from '../common/channel';
import { shell } from 'electron';

export function initHandlers() {
  let plexIntegration: PlexIntegration;

  createChannels({
    [Channel.OpenDb]: (event, path) => {
      plexIntegration = new PlexIntegration(path);
    },
    [Channel.LoadMovies]: () => plexIntegration.loadMovies(),
    [Channel.RenameMovies]: (event, transformedPaths) =>
      plexIntegration.renameMovies(transformedPaths),
    [Channel.RestoreAddedAt]: (event, ids) =>
      plexIntegration.restoreAddedAtTimes(ids),
    [Channel.ShowFolder]: (event, path) => shell.showItemInFolder(path),
  });
}
