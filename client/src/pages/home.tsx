import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useDownload } from "@/hooks/use-download";
import { 
  Download, 
  Music, 
  Video, 
  Zap, 
  Shield, 
  Smartphone, 
  Infinity,
  Play,
  User,
  Eye,
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  thumbnail?: string;
  viewCount?: number;
  likeCount?: number;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { 
    downloadId, 
    progress, 
    status, 
    error: downloadError, 
    startDownload, 
    downloadFile,
    reset 
  } = useDownload();

  const validateUrl = async () => {
    if (!url.trim()) {
      setValidationError("Please enter a TikTok URL");
      return;
    }

    const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i;
    if (!tiktokRegex.test(url)) {
      setValidationError("Please enter a valid TikTok URL");
      return;
    }

    setIsValidating(true);
    setValidationError("");

    try {
      const response = await apiRequest("POST", "/api/validate", { url });
      const data = await response.json();

      if (data.success) {
        setVideoInfo(data.info);
        setValidationError("");
      } else {
        setValidationError(data.error || "Failed to validate URL");
        setVideoInfo(null);
      }
    } catch (error) {
      setValidationError("Failed to validate URL. Please try again.");
      setVideoInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim() || !videoInfo) {
      await validateUrl();
      if (!videoInfo) return;
    }

    startDownload(url, format);
  };

  const handleNewDownload = () => {
    setUrl("");
    setVideoInfo(null);
    setValidationError("");
    reset();
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TikTok Downloader</h1>
              <p className="text-xs text-slate-400">Video & Audio Downloads</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Shield className="w-3 h-3 mr-1" />
              100% Safe
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              Fast
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-cyan-400/10 to-purple-500/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Download TikTok Videos
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Save your favorite TikTok videos and audio in high quality. No watermarks, fast downloads, completely free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">MP4 Video</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <Music className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-slate-300">MP3 Audio</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">No Watermark</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Download Interface */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* URL Input */}
          <Card className="bg-slate-900 border-slate-800 shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">
                Paste TikTok URL
              </CardTitle>
              <p className="text-center text-slate-400">
                Copy and paste the TikTok video link below
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://www.tiktok.com/@username/video/..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setValidationError("");
                    setVideoInfo(null);
                  }}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-pink-500"
                />
                {validationError && (
                  <p className="text-red-400 text-sm flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {validationError}
                  </p>
                )}
              </div>

              {/* Format Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    format === 'mp4' 
                      ? 'border-pink-500 bg-pink-500/10' 
                      : 'border-slate-700 bg-slate-950 hover:border-pink-400'
                  }`}
                  onClick={() => setFormat('mp4')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                          <Video className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Video (MP4)</h4>
                          <p className="text-sm text-slate-400">Download with video</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 border-2 rounded-full ${
                        format === 'mp4' ? 'border-pink-500' : 'border-slate-600'
                      }`}>
                        {format === 'mp4' && (
                          <div className="w-3 h-3 bg-pink-500 rounded-full m-0.5"></div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div className="flex items-center mb-1">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        High quality video
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        Original audio included
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    format === 'mp3' 
                      ? 'border-cyan-400 bg-cyan-400/10' 
                      : 'border-slate-700 bg-slate-950 hover:border-cyan-400'
                  }`}
                  onClick={() => setFormat('mp3')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center">
                          <Music className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Audio (MP3)</h4>
                          <p className="text-sm text-slate-400">Audio only</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 border-2 rounded-full ${
                        format === 'mp3' ? 'border-cyan-400' : 'border-slate-600'
                      }`}>
                        {format === 'mp3' && (
                          <div className="w-3 h-3 bg-cyan-400 rounded-full m-0.5"></div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div className="flex items-center mb-1">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        High quality audio
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                        Smaller file size
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!videoInfo && (
                <Button 
                  onClick={validateUrl}
                  disabled={!url.trim() || isValidating}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validate URL
                    </>
                  )}
                </Button>
              )}

              {videoInfo && (
                <Button 
                  onClick={handleDownload}
                  disabled={status === 'processing'}
                  className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-white font-semibold transform hover:scale-[1.02] transition-all"
                >
                  {status === 'processing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Now
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoInfo && (
            <Card className="bg-slate-900 border-slate-800 shadow-2xl mb-8">
              <CardHeader>
                <CardTitle className="text-white">Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 bg-slate-950 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{videoInfo.title}</h4>
                    <p className="text-sm text-slate-400 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {videoInfo.author}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {videoInfo.duration}
                      </span>
                      {videoInfo.viewCount && (
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatNumber(videoInfo.viewCount)}
                        </span>
                      )}
                      {videoInfo.likeCount && (
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {formatNumber(videoInfo.likeCount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={format === 'mp4' ? 'border-pink-500 text-pink-400' : 'border-cyan-400 text-cyan-400'}
                    >
                      {format.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Progress */}
          {status === 'processing' && (
            <Card className="bg-slate-900 border-slate-800 shadow-2xl mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent mr-2" />
                  {progress < 20 ? 'Initializing Download...' : 
                   progress < 60 ? 'Downloading Video...' : 
                   progress < 90 ? 'Processing File...' : 
                   'Finalizing...'}
                </CardTitle>
                <p className="text-slate-400">
                  {progress < 20 ? 'Getting video information and preparing download' : 
                   progress < 60 ? 'Downloading video content from TikTok servers' : 
                   progress < 90 ? 'Converting and optimizing your file' : 
                   'Almost done! Preparing your download'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center">
                      {progress < 20 ? <Clock className="w-4 h-4 mr-1" /> : 
                       progress < 60 ? <Download className="w-4 h-4 mr-1" /> : 
                       progress < 90 ? <Zap className="w-4 h-4 mr-1" /> : 
                       <CheckCircle className="w-4 h-4 mr-1" />}
                      Progress
                    </span>
                    <span className="text-white font-bold text-lg">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  
                  {/* Progress Steps */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className={`text-center p-2 rounded-lg transition-all ${
                      progress >= 20 ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <div className="text-xs font-medium">Initialize</div>
                    </div>
                    <div className={`text-center p-2 rounded-lg transition-all ${
                      progress >= 60 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <div className="text-xs font-medium">Download</div>
                    </div>
                    <div className={`text-center p-2 rounded-lg transition-all ${
                      progress >= 90 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <div className="text-xs font-medium">Process</div>
                    </div>
                    <div className={`text-center p-2 rounded-lg transition-all ${
                      progress >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <div className="text-xs font-medium">Complete</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={reset}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <div className="flex-1 bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400">Format</div>
                    <div className="text-sm font-semibold text-white">{format.toUpperCase()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Complete */}
          {status === 'completed' && (
            <Card className="bg-slate-900 border-green-500/30 shadow-2xl mb-8">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Download Complete!</h3>
                  <p className="text-slate-400">Your file is ready to download</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={downloadFile}
                    className="bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                  <Button 
                    onClick={handleNewDownload}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {(status === 'failed' || downloadError) && (
            <Card className="bg-slate-900 border-red-500/30 shadow-2xl mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-400 mb-1">Download Failed</h4>
                    <p className="text-sm text-red-300">
                      {downloadError || "Failed to process the video. Please check the URL and try again."}
                    </p>
                  </div>
                  <Button 
                    onClick={reset}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Our Downloader?</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Fast, reliable, and completely free TikTok video downloads with premium features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-900 border-slate-800 hover:border-pink-500/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-400">Download TikTok videos in seconds with our optimized processing system.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-cyan-400/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">High Quality</h3>
              <p className="text-slate-400">Preserve original video quality and audio clarity in all downloads.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-green-500/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Watermarks</h3>
              <p className="text-slate-400">Clean downloads without any watermarks or branding additions.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mobile Friendly</h3>
              <p className="text-slate-400">Perfect experience on all devices - mobile, tablet, and desktop.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-yellow-500/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Music className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Audio Extraction</h3>
              <p className="text-slate-400">Extract high-quality audio as MP3 files from any TikTok video.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Infinity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Unlimited Downloads</h3>
              <p className="text-slate-400">No limits on the number of videos you can download. Completely free.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Simple 3-step process to download any TikTok video</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-pink-500 to-transparent"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Copy URL</h3>
                <p className="text-slate-400">Copy the TikTok video URL from the app or website</p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Paste & Choose</h3>
                <p className="text-slate-400">Paste the URL and select MP4 or MP3 format</p>
              </div>
              
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Download</h3>
                <p className="text-slate-400">Click download and get your file instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">TikTok Downloader</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Fast and free TikTok video downloader. Respect copyright and privacy.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">© 2024 TikTok Downloader. Not affiliated with TikTok.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
