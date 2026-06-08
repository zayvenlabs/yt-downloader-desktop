/// <reference types="vite/client" /> ///

interface Window {
  electronAPI: {
    ping: () => Promise<{
      message: string;
      timestamp: string;
    }>;
  };
}