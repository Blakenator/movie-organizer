import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { registerElectronApiBridge } from '@superflag/super-ipc-preloader';
import { FileObject } from '../ui/pages/tv-shows/types';

registerElectronApiBridge(contextBridge, ipcRenderer);

contextBridge.exposeInMainWorld('electron', {
  getPathForFile: (file: FileObject) => {
    return webUtils.getPathForFile(file as any);
  },
});
