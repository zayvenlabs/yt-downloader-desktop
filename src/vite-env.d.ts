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
    runLocalTest: () => Promise<{
      success: boolean;
      output: string;
    }>;
    getYtDlpVersion: () => Promise<{
    version: string;
    }>;
    getVideoInfo: (url: string) => Promise<{
    title: string;
    uploader?: string;
    duration?: number;
    thumbnail?: string;
    webpage_url?: string;
    }>;
    downloadMp4: (url: string) => Promise<{
    success: boolean;
    filePath: string;
    }>;
  };
}