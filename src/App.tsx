import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  async function handlePing() {
    const response = await window.electronAPI.ping();
    setMessage(`${response.message} - ${response.timestamp}`);
  }

  return (
    <main>
      <h1>YT Downloader Desktop</h1>

      <button onClick={handlePing}>
        Test Electron IPC
      </button>

      {message && <p>{message}</p>}
    </main>
  );
}

export default App;