import { Channel, ChannelTypes } from '../common/channel';
import { ipcMain, IpcMainEvent } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

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

export function getAllFilesInFolder(path: string) {
  return Promise.resolve(getAllFiles(path));
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const subPath = path.join(dirPath, file);
    if (fs.statSync(subPath).isDirectory()) {
      arrayOfFiles = getAllFiles(subPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, file));
    }
  });

  return arrayOfFiles;
}
