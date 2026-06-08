import { useState } from "react";
import "./App.css";

type SystemInfo = {
  platform: string;
  arch: string;
  node: string;
  electron: string;
  homeDir: string;
};

function App() {
  const [message, setMessage] = useState("");
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [localTest, setLocalTest] = useState("");
  const [ytDlpVersion, setYtDlpVersion] = useState("");

  async function handlePing() {
    const response = await window.electronAPI.ping();
    setMessage(`${response.message} - ${response.timestamp}`);
  }

  async function handleSystemInfo() {
    const response = await window.electronAPI.getSystemInfo();
    setSystemInfo(response);
  }

  async function handleLocalTest() {
  const response = await window.electronAPI.runLocalTest();
  setLocalTest(response.output);
  }

  async function handleYtDlpVersion() {
  const response = await window.electronAPI.getYtDlpVersion();
  setYtDlpVersion(response.version);
  }

  return (
    <main>
      <h1>YT Downloader Desktop</h1>

      <button onClick={handlePing}>Test Electron IPC</button>
      <button onClick={handleSystemInfo}>Get System Info</button>
      <button onClick={handleLocalTest}>Run Local Command</button>

      {message && <p>{message}</p>}

      {systemInfo && (
        <pre>
          {JSON.stringify(systemInfo, null, 2)}
        </pre>
      )}

      {localTest && <p>{localTest}</p>}

      <button onClick={handleYtDlpVersion}>Get yt-dlp Version</button>
      {ytDlpVersion && <p>yt-dlp version: {ytDlpVersion}</p>}

    </main>
  );
}

export default App;