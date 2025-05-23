import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Ensure downloads directory exists
  const downloadsDir = path.join(process.cwd(), 'downloads');
  try {
    await mkdir(downloadsDir, { recursive: true });
  } catch (error) {
    console.log('Downloads directory already exists or error creating:', error);
  }



  // Start download process
  app.post("/api/download", async (req, res) => {
    try {
      const { url, format } = downloadRequestSchema.parse(req.body);

      const download = await storage.createDownload({ url, format });
      
      // Start background download process
      processDownload(download.id, url, format);

      res.json({ 
        success: true, 
        downloadId: download.id 
      });

    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request data' 
      });
    }
  });

  // Get download status
  app.get("/api/download/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    const download = await storage.getDownload(id);

    if (!download) {
      return res.status(404).json({ 
        success: false, 
        error: 'Download not found' 
      });
    }

    res.json({
      success: true,
      download: {
        id: download.id,
        status: download.status,
        title: download.title,
        author: download.author,
        duration: download.duration,
        fileSize: download.fileSize,
        format: download.format
      }
    });
  });

  // Download file
  app.get("/api/download/:id/file", async (req, res) => {
    const id = parseInt(req.params.id);
    const download = await storage.getDownload(id);

    if (!download || download.status !== 'completed' || !download.filePath) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found or not ready' 
      });
    }

    try {
      await access(download.filePath);
      
      const fileName = `${download.title || 'tiktok_video'}.${download.format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', download.format === 'mp4' ? 'video/mp4' : 'audio/mpeg');
      
      const fileStream = fs.createReadStream(download.filePath);
      fileStream.pipe(res);
      
      // Clean up file after download
      fileStream.on('end', async () => {
        try {
          await unlink(download.filePath!);
          await storage.deleteDownload(id);
        } catch (error) {
          console.error('Error cleaning up file:', error);
        }
      });

    } catch (error) {
      res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
  });

  async function processDownload(downloadId: number, url: string, format: string) {
    try {
      await storage.updateDownload(downloadId, { status: 'processing' });

      // Get video data from API
      const encodedUrl = encodeURIComponent(url);
      const apiUrl = `https://social-media-video-downloader.p.rapidapi.com/smvd/get/tiktok?url=${encodedUrl}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
          'x-rapidapi-key': '71c02bad3cmsha5e7e36928951c2p131773jsn1f13a647b5d2'
        }
      });

      if (!response.ok) {
        await storage.updateDownload(downloadId, { status: 'failed' });
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.links || data.links.length === 0) {
        await storage.updateDownload(downloadId, { status: 'failed' });
        return;
      }

      let downloadUrl: string;

      // Get the appropriate download URL based on format
      if (format === 'mp4') {
        // For video, find the best quality video link
        const videoLink = data.links.find(link => 
          link.quality === 'video_hd_original' || 
          link.quality === 'video_hd' || 
          link.quality.includes('video')
        );
        downloadUrl = videoLink?.link;
      } else {
        // For audio/MP3, find the audio link
        const audioLink = data.links.find(link => link.quality === 'audio');
        downloadUrl = audioLink?.link || audioLink?.renderLink;
      }

      if (!downloadUrl) {
        await storage.updateDownload(downloadId, { status: 'failed' });
        return;
      }

      // Download the file
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        await storage.updateDownload(downloadId, { status: 'failed' });
        return;
      }

      const extension = format === 'mp3' ? 'mp3' : 'mp4';
      const finalPath = path.join(downloadsDir, `${downloadId}.${extension}`);
      
      const fileStream = fs.createWriteStream(finalPath);
      const readableStream = fileResponse.body;
      
      if (!readableStream) {
        await storage.updateDownload(downloadId, { status: 'failed' });
        return;
      }

      // Convert ReadableStream to Node.js readable stream
      const reader = readableStream.getReader();
      
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileStream.write(Buffer.from(value));
        }
        fileStream.end();
      };

      await pump();

      // Update download with metadata
      const stats = fs.statSync(finalPath);
      const fileSize = formatFileSize(stats.size);

      await storage.updateDownload(downloadId, {
        status: 'completed',
        filePath: finalPath,
        fileSize: fileSize,
        title: data.title || 'TikTok Video',
        author: data.author || 'Unknown',
        duration: data.duration ? formatDuration(data.duration) : '0:00'
      });

    } catch (error) {
      console.error('Download process error:', error);
      await storage.updateDownload(downloadId, { status: 'failed' });
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return httpServer;
}
