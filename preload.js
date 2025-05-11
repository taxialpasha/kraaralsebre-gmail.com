const { contextBridge, ipcRenderer } = require('electron');

// التواصل بين شاشة الانتظار والعملية الرئيسية
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['splash-screen-loaded'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['init-complete'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});