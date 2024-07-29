import { contextBridge, ipcRenderer } from 'electron';
import { registerElectronApiBridge } from '@superflag/super-ipc/preloader';

registerElectronApiBridge(contextBridge, ipcRenderer);
