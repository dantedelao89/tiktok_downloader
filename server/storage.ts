import { downloads, type Download, type InsertDownload } from "@shared/schema";

export interface IStorage {
  getDownload(id: number): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined>;
  deleteDownload(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private downloads: Map<number, Download>;
  private currentId: number;

  constructor() {
    this.downloads = new Map();
    this.currentId = 1;
  }

  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = this.currentId++;
    const download: Download = {
      ...insertDownload,
      id,
      title: null,
      author: null,
      duration: null,
      thumbnail: null,
      fileSize: null,
      status: 'pending',
      filePath: null,
      createdAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined> {
    const download = this.downloads.get(id);
    if (!download) return undefined;

    const updatedDownload: Download = { ...download, ...updates };
    this.downloads.set(id, updatedDownload);
    return updatedDownload;
  }

  async deleteDownload(id: number): Promise<boolean> {
    return this.downloads.delete(id);
  }
}

export const storage = new MemStorage();
