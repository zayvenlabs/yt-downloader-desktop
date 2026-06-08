/// <reference types="vite/client" /> ///

interface Window {
  electronAPI: {
    ping: () => Promise<{
      message: string;
      timestamp: string;
    }>;
    getSystemInfo: () => Promise<{
      platform: string;
      arch: string;
      node: string;
      electron: string;
      homeDir: string;
    }>;
  };
}