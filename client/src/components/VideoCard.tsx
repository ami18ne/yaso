import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLikeVideo } from "@/hooks/useVideos";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedBadge from "./VerifiedBadge";
import { isVerifiedUser } from "@/lib/verifiedUsers";

interface VideoCardProps {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  creator: {
    name: string;
    avatar?: string;
    username: string;
  };
  caption: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  musicName?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function VideoCard({
  id,
  videoUrl,
  thumbnailUrl,
  creator,
  caption,
  likes: initialLikes,
  comments,
  isLiked = false,
  musicName,
  onLike,
  onComment,
  onShare,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikes, setLocalLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const likeVideoMutation = useLikeVideo();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0.7] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [videoUrl]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!localLiked) {
        handleLike();
      }
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 1000);
    }
    lastTapRef.current = now;
  }, [localLiked]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = localLiked;
    const previousLikes = localLikes;
    
    setLocalLiked(!previousLiked);
    setLocalLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);
    
    try {
      await likeVideoMutation.mutateAsync({ videoId: id, isLiked: previousLiked });
      onLike?.();
    } catch (error) {
      setLocalLiked(previousLiked);
      setLocalLikes(previousLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center bg-black snap-start snap-always"
      data-testid={`video-card-${creator.username}`}
    >
      <div
        className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-black flex items-center justify-center cursor-pointer"
        onClick={() => {
          handleDoubleTap();
          togglePlay();
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            className="w-full h-full object-contain max-h-screen"
            loop
            playsInline
            muted={isMuted}
            autoPlay
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.muted = isMuted;
              }
            }}
          />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={caption}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 to-black">
            <div className="text-center space-y-2 sm:space-y-4 px-4">
              <div className="text-4xl sm:text-6xl neon-text">🎬</div>
              <p className="text-xs sm:text-base text-white/60">Video Preview</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <motion.div 
              className="rounded-full bg-primary/80 p-3 sm:p-6 neon-glow-strong"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="h-8 sm:h-12 w-8 sm:w-12 text-white fill-white" strokeWidth={2} />
            </motion.div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="rounded-full bg-black/50 p-2 sm:p-4 flex-shrink-0">
              <Pause className="h-6 sm:h-8 w-6 sm:w-8 text-white" strokeWidth={2} />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div 
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      <div className="absolute bottom-32 sm:bottom-24 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/profile/${creator.username}`);
                }}
              >
                <Avatar className="h-10 w-10 border-2 border-primary neon-glow cursor-pointer">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="bg-primary text-white">
                    {creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-white hover:underline">{creator.name}</h3>
                    {isVerifiedUser(creator.username) && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-sm text-white/70">@{creator.username}</p>
                </div>
              </button>
              <Button
                size="sm"
                className="ml-auto neon-glow hover-elevate"
                data-testid="button-follow"
                onClick={(e) => {
                  e.stopPropagation();
                  logger.debug('Follow clicked');
                }}
              >
                Follow
              </Button>
            </div>
            <p className="text-white text-sm leading-relaxed line-clamp-2">{caption}</p>
            
            {musicName && (
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-6 h-6 rounded-full bg-primary/50 flex items-center justify-center animate-spin-slow">
                  <Music2 className="h-3 w-3" />
                </div>
                <span className="text-xs truncate max-w-[200px]">{musicName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="flex flex-col items-center gap-0.5 sm:gap-1 group"
              data-testid="button-like-video"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div 
                className={cn(
                  "rounded-full p-1.5 sm:p-3 transition-all flex-shrink-0",
                  localLiked
                    ? "bg-primary neon-glow-strong"
                    : "bg-white/10 hover:bg-white/20"
                )}
                animate={localLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  className="h-4 sm:h-6 w-4 sm:w-6 text-white transition-all" 
                  fill={localLiked ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </motion.div>
              <span className="text-white text-xs font-medium">{formatCount(localLikes)}</span>
            </motion.button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onComment?.();
                logger.debug('Comment clicked');
              }}
              className="flex flex-col items-center gap-1 group hover:opacity-80 transition-opacity"
              data-testid="button-comment-video"
            >
              <div className="rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors">
                <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-white text-xs font-medium">{formatCount(comments)}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
                logger.debug('Share clicked');
              }}
              className="flex flex-col items-center gap-1 group hover:opacity-80 transition-opacity"
              data-testid="button-share-video"
            >
              <div className="rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors">
                <Share2 className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
