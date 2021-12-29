import { ipcRenderer, contextBridge } from 'electron';

console.log('Preloading ipcRenderer...');
// usable as window.electron.ipcRenderer
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
});
