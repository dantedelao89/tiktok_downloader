import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { spawn } from "child_process";
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

  // Validate TikTok URL and get video info
  app.post("/api/validate", async (req, res) => {
    try {
      const { url } = downloadRequestSchema.parse(req.body);

      // Use yt-dlp to get video information
      const ytDlpProcess = spawn('yt-dlp', [
        '--dump-json',
        '--no-download',
        url
      ]);

      let output = '';
      let error = '';

      ytDlpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytDlpProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const videoInfo = JSON.parse(output);
            res.json({
              success: true,
              info: {
                title: videoInfo.title || 'TikTok Video',
                author: videoInfo.uploader || 'Unknown',
                duration: videoInfo.duration ? formatDuration(videoInfo.duration) : '0:00',
                thumbnail: videoInfo.thumbnail,
                viewCount: videoInfo.view_count,
                likeCount: videoInfo.like_count,
              }
            });
          } catch (parseError) {
            res.status(400).json({ 
              success: false, 
              error: 'Invalid video information received' 
            });
          }
        } else {
          res.status(400).json({ 
            success: false, 
            error: 'Failed to fetch video information. Please check the URL.' 
          });
        }
      });

    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request data' 
      });
    }
  });

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

      const outputPath = path.join(downloadsDir, `${downloadId}.%(ext)s`);
      
      let ytDlpArgs = [
        '-o', outputPath,
        '--no-playlist'
      ];

      if (format === 'mp3') {
        ytDlpArgs.push(
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '192K'
        );
      } else {
        ytDlpArgs.push(
          '-f', 'best[ext=mp4]'
        );
      }

      ytDlpArgs.push(url);

      const ytDlpProcess = spawn('yt-dlp', ytDlpArgs);

      let error = '';
      ytDlpProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      ytDlpProcess.on('close', async (code) => {
        if (code === 0) {
          // Find the downloaded file
          const extension = format === 'mp3' ? 'mp3' : 'mp4';
          const finalPath = path.join(downloadsDir, `${downloadId}.${extension}`);
          
          try {
            await access(finalPath);
            const stats = fs.statSync(finalPath);
            const fileSize = formatFileSize(stats.size);

            await storage.updateDownload(downloadId, {
              status: 'completed',
              filePath: finalPath,
              fileSize: fileSize
            });
          } catch (error) {
            await storage.updateDownload(downloadId, { status: 'failed' });
          }
        } else {
          console.error('yt-dlp error:', error);
          await storage.updateDownload(downloadId, { status: 'failed' });
        }
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
