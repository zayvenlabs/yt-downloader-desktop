const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const { spawn } = require("child_process");
const path = require("path");

const isDev = !app.isPackaged;

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
        reject({
          error: error || "Command failed",
          code,
        });
        return;
      }

      resolve({
        success: true,
        output: output.trim(),
      });
    });
  });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});