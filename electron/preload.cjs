const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("app:ping"),
  getSystemInfo: () => ipcRenderer.invoke("app:get-system-info"),
  runLocalTest: () => ipcRenderer.invoke("app:run-local-test"),
  getYtDlpVersion: () => ipcRenderer.invoke("app:get-ytdlp-version"),
  getVideoInfo: (url) => ipcRenderer.invoke("video:get-info", url),  
  downloadMp4: (url) => ipcRenderer.invoke("video:download-mp4", url),
  downloadMp3: (url) => ipcRenderer.invoke("video:download-mp3", url),
});