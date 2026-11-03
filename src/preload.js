const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('overlay', {
  onWpm: (fn) => ipcRenderer.on('wpm', (_e, d) => fn(d)),
  close: () => ipcRenderer.send('close'),
});
