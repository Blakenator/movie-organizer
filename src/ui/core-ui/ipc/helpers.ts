import { Channel, ChannelTypes } from '../../../common/channel';
import type { IpcRenderer } from 'electron';

declare const window: Window &
  typeof globalThis & { electron: { ipcRenderer: IpcRenderer } };

export function ipcOnce<T extends Channel>(
  channel: T,
  ...args: ChannelTypes[T][0]
): Promise<ChannelTypes[T][1]> {
  console.log('invoke', channel, args);
  return new Promise((resolve, reject) =>
    window.electron.ipcRenderer
      .invoke(channel, ...args)
      .then((val) => resolve(val))
      .catch((err) => {
        console.error(err);
        return reject(err);
      })
  );
}
