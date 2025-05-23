import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface DownloadState {
  downloadId: number | null;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error: string | null;
}

export function useDownload() {
  const [state, setState] = useState<DownloadState>({
    downloadId: null,
    progress: 0,
    status: 'idle',
    error: null,
  });

  const startDownload = async (url: string, format: 'mp4' | 'mp3') => {
    try {
      setState(prev => ({ ...prev, status: 'processing', error: null, progress: 0 }));

      const response = await apiRequest("POST", "/api/download", { url, format });
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ ...prev, downloadId: data.downloadId }));
      } else {
        setState(prev => ({ 
          ...prev, 
          status: 'failed', 
          error: data.error || 'Failed to start download'
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'failed', 
        error: 'Failed to start download. Please try again.'
      }));
    }
  };

  const checkStatus = async (downloadId: number) => {
    try {
      const response = await fetch(`/api/download/${downloadId}/status`);
      const data = await response.json();

      if (data.success) {
        const download = data.download;
        
        if (download.status === 'completed') {
          setState(prev => ({ ...prev, status: 'completed', progress: 100 }));
        } else if (download.status === 'failed') {
          setState(prev => ({ 
            ...prev, 
            status: 'failed', 
            error: 'Download failed. Please try again.'
          }));
        } else if (download.status === 'processing') {
          // Simulate progress for better UX
          setState(prev => ({ 
            ...prev, 
            progress: Math.min(prev.progress + Math.random() * 15, 95)
          }));
        }
      }
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const downloadFile = () => {
    if (state.downloadId) {
      window.location.href = `/api/download/${state.downloadId}/file`;
    }
  };

  const reset = () => {
    setState({
      downloadId: null,
      progress: 0,
      status: 'idle',
      error: null,
    });
  };

  // Poll for download status
  useEffect(() => {
    if (state.downloadId && state.status === 'processing') {
      const interval = setInterval(() => {
        checkStatus(state.downloadId!);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.downloadId, state.status]);

  return {
    downloadId: state.downloadId,
    progress: state.progress,
    status: state.status,
    error: state.error,
    startDownload,
    downloadFile,
    reset,
  };
}
