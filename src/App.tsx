import { useEffect, useState } from "react";
import "./App.css";

type VideoInfo = {
  title: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
};

function formatDuration(seconds?: number) {
  if (!seconds) return "Durée inconnue";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function App() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoError, setVideoError] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [downloadFolder, setDownloadFolder] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [progressText, setProgressText] = useState("");

  async function handleGetVideoInfo() {
    setVideoError("");
    setVideoInfo(null);
    setProgress(null);
    setProgressText("");
    setDownloadStatus("");

    try {
      const response = await window.electronAPI.getVideoInfo(url);
      setVideoInfo(response);
    } catch (error) {
  console.error(error);

  const message =
    error instanceof Error
      ? error.message
      : "Impossible de récupérer les informations vidéo.";

  setVideoError(message);
}
  }

  async function handleDownloadMp4() {
    setProgress(0);
    setProgressText("");
    setDownloadStatus("Téléchargement MP4 en cours...");

    try {
      const response = await window.electronAPI.downloadMp4(url, downloadFolder);
      setDownloadStatus(`Téléchargement MP4 terminé : ${response.filePath}`);
    } catch (error) {
      console.error(error);
      setDownloadStatus("Téléchargement MP4 impossible.");
    }
  }

  async function handleDownloadMp3() {
    setProgress(0);
    setProgressText("");
    setDownloadStatus("Téléchargement MP3 en cours...");

    try {
      const response = await window.electronAPI.downloadMp3(url, downloadFolder);
      setDownloadStatus(`Téléchargement MP3 terminé : ${response.filePath}`);
    } catch (error) {
      console.error(error);
      setDownloadStatus("Téléchargement MP3 impossible.");
    }
  }

  async function handleSelectFolder() {
    const folder = await window.electronAPI.selectDownloadFolder();

    if (folder) {
      setDownloadFolder(folder);
    }
  }

  useEffect(() => {
    window.electronAPI.onDownloadProgress((data) => {
      if (data.percent !== null) {
        setProgress(data.percent);
      }

      setProgressText(data.text);
    });

    return () => {
      window.electronAPI.removeDownloadProgressListener();
    };
  }, []);

  return (
    <main className="app-shell">
      <div className="noise" />

      <section className="hero-panel">
        <p className="eyebrow">LOCAL MEDIA TOOL</p>

        <h1>
          YT <span>DOWNLOADER</span>
        </h1>

        <p className="subtitle">
          Télécharge tes vidéos localement, sans serveur distant.
        </p>

        <div className="url-card">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Colle une URL vidéo..."
          />

          <button onClick={handleGetVideoInfo}>
            Analyser
          </button>
        </div>

        <div className="folder-row">
          <button className="ghost-button" onClick={handleSelectFolder}>
            Choisir un dossier
          </button>

          <span>
            {downloadFolder || "Dossier par défaut : Téléchargements"}
          </span>
        </div>

        {videoError && <p className="error">{videoError}</p>}

        {videoInfo && (
          <div className="video-card">
            {videoInfo.thumbnail && (
              <img src={videoInfo.thumbnail} alt={videoInfo.title} />
            )}

            <div className="video-content">
              <p className="video-label">VIDÉO DÉTECTÉE</p>
              <h2>{videoInfo.title}</h2>
              <p>{videoInfo.uploader}</p>
              <p>{formatDuration(videoInfo.duration)}</p>

              <div className="actions">
                <button onClick={handleDownloadMp4}>Télécharger MP4</button>
                <button onClick={handleDownloadMp3}>Télécharger MP3</button>
              </div>
            </div>
          </div>
        )}

        {progress !== null && (
          <div className="progress-block">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>{Math.round(progress)}%</p>
          </div>
        )}

        {downloadStatus && <p className="status">{downloadStatus}</p>}

        {progressText && <p className="log-line">{progressText}</p>}

        <div className="features">
          <div>
            <strong>LOCAL</strong>
            <span>Aucun VPS</span>
          </div>
          <div>
            <strong>MP4</strong>
            <span>Haute qualité</span>
          </div>
          <div>
            <strong>MP3</strong>
            <span>Audio propre</span>
          </div>
          <div>
            <strong>SAFE</strong>
            <span>Sur ton PC</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;