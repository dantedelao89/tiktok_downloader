# TikTok Downloader Application

## Overview

This is a full-stack web application for downloading TikTok videos in either MP4 (video) or MP3 (audio) format. The application uses a modern tech stack with React on the frontend, Express.js on the backend, and PostgreSQL for data persistence, all integrated with external video processing tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Theme**: Dark theme with pink accent colors, modern glassmorphism design

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling and optimization

### Database Layer
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: `shared/schema.ts` for type-safe sharing between frontend and backend

## Key Components

### Database Schema
The application uses a single `downloads` table with the following structure:
- `id`: Primary key (serial)
- `url`: TikTok URL (required)
- `format`: Download format - 'mp4' or 'mp3' (required)
- `title`, `author`, `duration`, `thumbnail`: Video metadata
- `fileSize`: File size information
- `status`: Download status - 'pending', 'processing', 'completed', 'failed'
- `filePath`: Storage path for downloaded files
- `createdAt`: Timestamp for record creation

### API Routes
- `POST /api/validate`: Validates TikTok URLs and fetches video metadata
- `POST /api/download`: Initiates download process
- `GET /api/download/:id/status`: Checks download progress and status

### Storage Strategy
- **Development**: In-memory storage using `MemStorage` class
- **Production**: Database storage through Drizzle ORM
- **File Storage**: Local filesystem in `downloads/` directory

### Video Processing
- **Tool**: yt-dlp for video information extraction and downloading
- **Process**: Spawned child processes for video processing
- **Formats**: Supports both MP4 video and MP3 audio extraction

## Data Flow

1. **URL Validation**: User submits TikTok URL → validation against TikTok domain patterns → yt-dlp metadata extraction
2. **Download Initiation**: Validated request → database record creation → background processing start
3. **Progress Tracking**: Client polls status endpoint → real-time progress updates → completion notification
4. **File Delivery**: Completed downloads served as static files from downloads directory

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL connection for Neon Database
- **wouter**: Lightweight React routing

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **drizzle-kit**: Database migration management

### External System Dependencies
- **yt-dlp**: Command-line video downloader (must be installed on system)
- **PostgreSQL**: Database server (provided by Replit/Neon)

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Server**: tsx with hot reloading
- **Port**: 5000 with Vite middleware
- **Database**: Environment variable `DATABASE_URL` required

### Production Deployment
- **Build Process**: 
  1. `vite build` - Frontend compilation to `dist/public`
  2. `esbuild` - Backend bundling to `dist/index.js`
- **Runtime**: `node dist/index.js`
- **Static Files**: Served from `dist/public`
- **Database**: Production PostgreSQL via `DATABASE_URL`

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Auto-deployment**: Configured for autoscale deployment target
- **Port Mapping**: Internal 5000 → External 80
- **Environment**: Replit-specific development enhancements included

### File Management
- **Downloads Directory**: Created programmatically in `downloads/`
- **Temporary Files**: Managed lifecycle with cleanup after serving
- **Static Serving**: Express serves downloaded files as static content

The application follows a clean separation of concerns with shared TypeScript types between frontend and backend, comprehensive error handling, and scalable architecture suitable for both development and production environments.