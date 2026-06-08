const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
} = require("electron");

const os = require("os");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const isDev = !app.isPackaged;

function getBinaryPath(binaryName) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "binaries", binaryName);
  }

  return path.join(__dirname, "../binaries", binaryName);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function sendDownloadProgress(event, type, text) {
  const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);

  event.sender.send("download:progress", {
    type,
    percent: percentMatch ? Number(percentMatch[1]) : null,
    text: text.trim(),
  });
}

ipcMain.handle("app:ping", async () => {
  return {
    message: "Electron backend is ready ✅",
    timestamp: new Date().toISOString(),
  };
});

ipcMain.handle("app:get-system-info", async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    node: process.versions.node,
    electron: process.versions.electron,
    homeDir: os.homedir(),
  };
});

ipcMain.handle("app:run-local-test", async () => {
  return new Promise((resolve, reject) => {
    const child = spawn("cmd", ["/c", "echo Local command works"]);

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject({ error: error || "Command failed", code });
        return;
      }

      resolve({
        success: true,
        output: output.trim(),
      });
    });
  });
});

ipcMain.handle("app:get-ytdlp-version", async () => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getBinaryPath("yt-dlp.exe");

    const child = spawn(ytDlpPath, ["--version"]);

    let output = "";
    let error = "";

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject({ error: error || "yt-dlp failed", code });
        return;
      }

      resolve({
        version: output.trim(),
      });
    });
  });
});

ipcMain.handle("video:get-info", async (_event, url) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getBinaryPath("yt-dlp.exe");

    const child = spawn(ytDlpPath, [
      "--js-runtimes",
      "node",
      "--dump-json",
      "--no-playlist",
      url,
    ]);

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error || `yt-dlp exited with code ${code}`));
        return;
      }

      try {
        const info = JSON.parse(output);

        resolve({
          title: info.title,
          uploader: info.uploader,
          duration: info.duration,
          thumbnail: info.thumbnail,
          webpage_url: info.webpage_url,
        });
      } catch {
        reject(new Error("Invalid yt-dlp JSON response"));
      }
    });
  });
});

ipcMain.handle("video:download-mp4", async (_event, { url, folder }) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getBinaryPath("yt-dlp.exe");
    const ffmpegDir = app.isPackaged
  ? path.join(process.resourcesPath, "binaries")
  : path.join(__dirname, "../binaries");

    const downloadsDir =
      folder || path.join(app.getPath("downloads"), "YT Downloader Desktop");

    fs.mkdirSync(downloadsDir, { recursive: true });

    const outputTemplate = path.join(downloadsDir, "%(title).80s.%(ext)s");

    const child = spawn(ytDlpPath, [
      "--newline",
      "--js-runtimes",
      "node",
      "--ffmpeg-location",
      ffmpegDir,
      "-f",
      "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]/best",
      "--merge-output-format",
      "mp4",
      "--no-playlist",
      "--restrict-filenames",
      "-o",
      outputTemplate,
      url,
    ]);

    let error = "";

    child.stdout.on("data", (data) => {
      sendDownloadProgress(_event, "mp4", data.toString());
    });

    child.stderr.on("data", (data) => {
      const text = data.toString();
      error += text;
      console.log(text);
      sendDownloadProgress(_event, "mp4", text);

      const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);

      _event.sender.send("download:progress", {
        type: "mp4",
        percent: percentMatch ? Number(percentMatch[1]) : null,
        text: text.trim(),
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject({ error, code });
        return;
      }

      shell.openPath(downloadsDir);

      resolve({
        success: true,
        filePath: downloadsDir,
      });
    });
  });
});

ipcMain.handle("video:download-mp3", async (_event, { url, folder }) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getBinaryPath("yt-dlp.exe");
    const ffmpegDir = app.isPackaged
  ? path.join(process.resourcesPath, "binaries")
  : path.join(__dirname, "../binaries");

    const downloadsDir =
      folder || path.join(app.getPath("downloads"), "YT Downloader Desktop");

    fs.mkdirSync(downloadsDir, { recursive: true });

    const outputTemplate = path.join(downloadsDir, "%(title).80s.%(ext)s");

    const child = spawn(ytDlpPath, [
      "--newline",
      "--js-runtimes",
      "node",
      "--ffmpeg-location",
      ffmpegDir,
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--no-keep-video",
      "--no-playlist",
      "--restrict-filenames",
      "-o",
      outputTemplate,
      url,
    ]);

    let error = "";

    child.stdout.on("data", (data) => {
    sendDownloadProgress(_event, "mp3", data.toString());
    });

    child.stderr.on("data", (data) => {
    const text = data.toString();
    error += text;
    console.log(text);

  const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);

  _event.sender.send("download:progress", {
    type: "mp3",
    percent: percentMatch ? Number(percentMatch[1]) : null,
    text: text.trim(),
  });
});

    child.on("close", (code) => {
      if (code !== 0) {
        reject({ error, code });
        return;
      }

      shell.openPath(downloadsDir);

      resolve({
        success: true,
        filePath: downloadsDir,
      });
    });
  });
});

ipcMain.handle("app:select-download-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});