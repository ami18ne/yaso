import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from "react";
import { Play, Pause, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageBubbleProps {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  imageUrl?: string;
  audioUrl?: string;
}

export default function MessageBubble({
  id,
  text,
  timestamp,
  isSent,
  senderName,
  senderAvatar,
  isRead = false,
  imageUrl,
  audioUrl,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleToggleReaction = async (reaction = 'heart') => {
    try {
      await fetch(`/api/messages/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, reaction }),
      })
    } catch (err) {
      console.error('Failed to toggle reaction', err)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      data-testid={`message-${isSent ? 'sent' : 'received'}`}
      className={cn(
        "flex gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        (isSent && !isRTL) || (!isSent && isRTL) ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isSent && senderName && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {senderName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", (isSent && !isRTL) || (!isSent && isRTL) ? "items-end" : "items-start")}>
        {!isSent && senderName && (
          <span className={`text-xs text-muted-foreground px-3 ${isRTL ? 'text-right' : 'text-left'}`}>{senderName}</span>
        )}
        
        <div
          className={cn(
            "rounded-2xl max-w-md break-words overflow-hidden",
            isSent
              ? "bg-primary text-primary-foreground neon-glow"
              : "bg-card border border-card-border"
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {imageUrl && (
            <div className="w-full">
              <img 
                src={imageUrl} 
                loading="lazy"
                alt="Shared image" 
                className="w-full max-w-[280px] rounded-t-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(imageUrl, '_blank')}
              />
            </div>
          )}
          
          {audioUrl && (
            <div className="px-4 py-3 flex items-center gap-3">
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                onEnded={handleAudioEnded}
              />
              <button
                onClick={handlePlayPause}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isSent ? "bg-white/20 hover:bg-white/30" : "bg-primary/20 hover:bg-primary/30"
                )}
              >
                {isPlaying ? (
                  <Pause className={cn("h-5 w-5", isSent ? "text-white" : "text-primary")} />
                ) : (
                  <Play className={cn("h-5 w-5", isSent ? "text-white" : "text-primary")} />
                )}
              </button>
              <div className="flex-1 min-w-[100px]">
                <div className={cn(
                  "h-1 rounded-full overflow-hidden",
                  isSent ? "bg-white/20" : "bg-muted"
                )}>
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      isSent ? "bg-white" : "bg-primary"
                    )}
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <span className={cn(
                  "text-xs mt-1 block",
                  isSent ? "text-white/70" : "text-muted-foreground"
                )}>
                  {formatDuration(audioDuration)}
                </span>
              </div>
            </div>
          )}
          
          {text && (
            <p className={cn(
              "text-sm leading-relaxed",
              (imageUrl || audioUrl) ? "px-4 py-2" : "px-4 py-2.5"
            )}>{text}</p>
          )}
        </div>

        <div className={`flex items-center gap-1.5 px-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isSent && (
            <span className="text-xs text-primary">
              {isRead ? "✓✓" : "✓"}
            </span>
          )}
          <button onClick={() => handleToggleReaction('heart')} className="ml-2 text-muted-foreground hover:text-red-500">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
