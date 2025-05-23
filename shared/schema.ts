import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  format: text("format").notNull(), // 'mp4' or 'mp3'
  title: text("title"),
  author: text("author"),
  duration: text("duration"),
  thumbnail: text("thumbnail"),
  fileSize: text("file_size"),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  format: true,
});

export const downloadRequestSchema = z.object({
  url: z.string().url().refine((url) => {
    return /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i.test(url);
  }, "Must be a valid TikTok URL"),
  format: z.enum(['mp4', 'mp3']),
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
