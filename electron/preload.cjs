const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("app:ping"),
  getSystemInfo: () => ipcRenderer.invoke("app:get-system-info"),
});