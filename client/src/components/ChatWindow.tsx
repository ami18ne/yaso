import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import { Send, Image, Mic, X, Square, Loader2, Smile } from "lucide-react";
import { logger } from "@/lib/logger";
import { uploadChatMedia, uploadVoiceMessage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "./EmojiPicker";

interface Message {
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

interface ChatWindowProps {
  chatName: string;
  chatAvatar?: string;
  chatUsername?: string;
  isOnline?: boolean;
  messages: Message[];
  onSendMessage?: (message: string, imageUrl?: string, audioUrl?: string) => void;
}

export default function ChatWindow({
  chatName,
  chatAvatar,
  chatUsername,
  isOnline = false,
  messages,
  onSendMessage,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [, setLocation] = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isRTL } = useLanguage();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: isRTL ? 'نوع ملف غير صالح' : 'Invalid file type',
        description: isRTL ? 'يرجى اختيار ملف صورة.' : 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: isRTL ? 'الملف كبير جداً' : 'File too large',
        description: isRTL ? 'يجب أن يكون حجم الصورة أقل من 25MB.' : 'Image must be less than 25MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      logger.error('Error starting recording:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'لا يمكن الوصول إلى الميكروفون' : 'Cannot access microphone',
        variant: 'destructive',
      });
    }
  };

  const cleanupRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        logger.error('Error stopping tracks:', e);
      }
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendVoiceMessage(audioBlob);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    cleanupRecording();
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!user || !onSendMessage) {
      cleanupRecording();
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadVoiceMessage(audioBlob, user.id);
      onSendMessage('', undefined, result.url);
    } catch (error) {
      logger.error('Error sending voice message:', error);
      cleanupRecording();
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل إرسال الرسالة الصوتية' : 'Failed to send voice message',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setRecordingTime(0);
    }
  };

  const handleSend = async () => {
    if (!onSendMessage || (!newMessage.trim() && !selectedImage)) return;

    try {
      setIsUploading(true);
      let imageUrl: string | undefined;

      if (selectedImage && user) {
        const result = await uploadChatMedia(selectedImage, user.id);
        imageUrl = result.url;
      }

      onSendMessage(newMessage, imageUrl);
      setNewMessage("");
      handleRemoveImage();
    } catch (error) {
      logger.error('Error sending message:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">
                {isRTL ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} {...message} />
            ))
          )}
        </div>
      </ScrollArea>

      {imagePreview && (
        <div className="border-t border-border/50 bg-background p-3">
          <div className="max-w-2xl mx-auto">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border/50 bg-background p-3 pb-20 md:pb-4">
        <div className={`flex items-center gap-2 max-w-2xl mx-auto ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {isRecording ? (
            <>
              <Button
                onClick={cancelRecording}
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center justify-center gap-2 h-11 bg-destructive/10 rounded-xl">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-destructive font-medium">{formatTime(recordingTime)}</span>
              </div>
              <Button
                onClick={stopRecording}
                size="icon"
                className="h-11 w-11 rounded-xl bg-destructive hover:bg-destructive/90"
              >
                <Square className="h-5 w-5 fill-current" />
              </Button>
            </>
          ) : (
            <>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <EmojiPicker
                onSelect={(emoji) => setNewMessage(prev => prev + emoji)}
                trigger={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-11 w-11 rounded-xl hover:bg-muted/50 flex-shrink-0"
                    disabled={isUploading}
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                }
                disabled={isUploading}
              />
              <Button
                onClick={() => imageInputRef.current?.click()}
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-xl hover:bg-muted/50 flex-shrink-0"
                disabled={isUploading}
              >
                <Image className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                onClick={startRecording}
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-xl hover:bg-muted/50 flex-shrink-0"
                disabled={isUploading}
              >
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                className={`flex-1 h-11 bg-muted/50 border-border/50 focus:border-primary rounded-xl text-base ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                data-testid="input-message"
                disabled={isUploading}
              />
              <Button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !selectedImage) || isUploading}
                size="icon"
                className="h-11 w-11 rounded-xl gradient-primary hover:opacity-90 flex-shrink-0"
                data-testid="button-send-message"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
