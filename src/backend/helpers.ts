import { Channel, ChannelTypes } from '../common/channel';
import { ipcMain, IpcMainEvent } from 'electron';

export function createChannels(map: {
  [T in Channel]: (
    event: IpcMainEvent,
    ...args: ChannelTypes[T][0]
  ) => ChannelTypes[T][1] | Promise<ChannelTypes[T][1]>;
}) {
  Object.entries(map).forEach(([channel, executor]) => {
    ipcMain.handle(channel, executor);
  });
}
