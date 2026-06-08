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
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [videoError, setVideoError] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");

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

  async function handleGetVideoInfo() {
  setVideoError("");
  setVideoInfo(null);

  try {
    const response = await window.electronAPI.getVideoInfo(url);
    setVideoInfo(response);
    } catch (error) {
    setVideoError("Impossible de récupérer les informations vidéo.");
    console.error(error);
    }
  }

  async function handleDownloadMp4() {
  setDownloadStatus("Téléchargement MP4 en cours...");

  try {
    const response = await window.electronAPI.downloadMp4(url);
    setDownloadStatus(`Téléchargement terminé : ${response.filePath}`);
    } catch (error) {
    console.error(error);
    setDownloadStatus("Téléchargement impossible.");
    }
  }

  async function handleDownloadMp3() {
  setDownloadStatus("Téléchargement MP3 en cours...");

  try {
      const response = await window.electronAPI.downloadMp3(url);
      setDownloadStatus(`Téléchargement MP3 terminé : ${response.filePath}`);
    } catch (error) {
      console.error(error);
      setDownloadStatus("Téléchargement MP3 impossible.");
    }
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

      <div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Colle une URL vidéo"
          style={{ width: "420px", padding: "8px" }}
        />

        <button onClick={handleGetVideoInfo}>
          Get Video Info
        </button>
      </div>

      {videoError && <p>{videoError}</p>}

      {videoInfo && (
        <div>
          <h2>{videoInfo.title}</h2>
          <p>{videoInfo.uploader}</p>
          <p>{videoInfo.duration}s</p>

          {videoInfo.thumbnail && (
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              style={{ width: "320px", borderRadius: "12px" }}
            />
          )}
        </div>
      )}

      <button onClick={handleDownloadMp4}>Download MP4</button>
      {downloadStatus && <p>{downloadStatus}</p>}

      <button onClick={handleDownloadMp3}>Download MP3</button>

    </main>
  );
  
}

export default App;