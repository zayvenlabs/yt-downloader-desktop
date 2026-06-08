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

  async function handlePing() {
    const response = await window.electronAPI.ping();
    setMessage(`${response.message} - ${response.timestamp}`);
  }

  async function handleSystemInfo() {
    const response = await window.electronAPI.getSystemInfo();
    setSystemInfo(response);
  }

  return (
    <main>
      <h1>YT Downloader Desktop</h1>

      <button onClick={handlePing}>Test Electron IPC</button>
      <button onClick={handleSystemInfo}>Get System Info</button>

      {message && <p>{message}</p>}

      {systemInfo && (
        <pre>
          {JSON.stringify(systemInfo, null, 2)}
        </pre>
      )}
    </main>
  );
}

export default App;