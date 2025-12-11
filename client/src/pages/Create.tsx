import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Video, X, Sparkles, Upload, Film, Wand2, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { uploadMedia } from "@/lib/storage";
import { logger } from "@/lib/logger";
import MediaEditor from "@/components/MediaEditor";
import EmojiPicker from "@/components/EmojiPicker";
import type { MusicTrack } from "@/lib/musicLibrary";

export default function Create() {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createPostMutation = useCreatePost();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const handleSelectImage = () => {
    imageInputRef.current?.click();
  };

  const handleSelectVideo = () => {
    videoInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setMediaType("image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setMediaType("video");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setProcessedFile(null);
    setShowEditor(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleEditorSave = (file: File, selectedMusic?: MusicTrack) => {
    setProcessedFile(file);
    setShowEditor(false);
    toast({
      title: isRTL ? "تم التعديل!" : "Edited!",
      description: isRTL ? "تم تطبيق التعديلات بنجاح" : "Your edits have been applied",
    });
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  const handlePost = async () => {
    if (!caption.trim()) {
      toast({
        title: isRTL ? "الوصف مطلوب" : "Missing caption",
        description: isRTL ? "يرجى إضافة وصف للمنشور" : "Please add a caption to your post.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: isRTL ? "غير مسجل الدخول" : "Not logged in",
        description: isRTL ? "يجب تسجيل الدخول لنشر منشور" : "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      let mediaUrl = null;

      const fileToUpload = processedFile || selectedFile;
      if (fileToUpload && mediaType) {
        const result = await uploadMedia(fileToUpload, mediaType, user.id);
        mediaUrl = result.url;
      }

      await createPostMutation.mutateAsync({
        content: caption,
        image_url: mediaUrl,
      });

      setCaption("");
      handleRemoveMedia();

      toast({
        title: "Posted!",
        description: "Your post has been shared successfully.",
      });

      setTimeout(() => {
        setLocation("/");
      }, 500);
    } catch (error) {
      logger.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (showEditor && selectedFile && mediaType) {
    return (
      <div className="h-full">
        <MediaEditor
          file={selectedFile}
          mediaType={mediaType}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 pb-24 md:pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">{isRTL ? 'إنشاء منشور' : 'Create Post'}</h1>
            </div>
            <Link href="/create-video">
              <Button variant="outline" size="sm" className="gap-2">
                <Film className="h-4 w-4" />
                {isRTL ? 'نشر فيديو' : 'Post Video'}
              </Button>
            </Link>
          </div>

          <Card className="p-3 sm:p-5 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-border/50">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                    {user?.email?.slice(0, 2).toUpperCase() || "ME"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user?.user_metadata?.username || user?.email?.split('@')[0] || "Your Account"}</h3>
                  <p className="text-sm text-muted-foreground">Share your moment</p>
                </div>
              </div>

              {previewUrl && (
                <div className="relative w-full bg-muted rounded-xl overflow-hidden animate-scale-in" style={{ maxHeight: 'min(500px, 70vh)' }}>
                  <button
                    onClick={handleRemoveMedia}
                    className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm rounded-full p-2 hover:bg-black/90 transition-colors"
                    data-testid="button-remove-media"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {mediaType === "image" ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  {processedFile && (
                    <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />
                      {isRTL ? 'تم التعديل' : 'Edited'}
                    </div>
                  )}
                </div>
              )}

              {previewUrl && mediaType === "video" && !processedFile && (
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(true)}
                  className="w-full h-11 gap-2 rounded-xl"
                >
                  <Wand2 className="h-4 w-4" />
                  {isRTL ? 'إضافة فلاتر وموسيقى' : 'Add Filters & Music'}
                </Button>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />

              {!previewUrl && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    className="min-h-24 sm:h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 p-3"
                    onClick={handleSelectImage}
                    data-testid="button-select-image"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Image className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">{isRTL ? 'إضافة صورة' : 'Add Photo'}</span>
                  </button>
                  <button
                    className="min-h-24 sm:h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 p-3"
                    onClick={handleSelectVideo}
                    data-testid="button-select-video"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">{isRTL ? 'إضافة فيديو' : 'Add Video'}</span>
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{isRTL ? 'الوصف' : 'Caption'}</label>
                  <EmojiPicker
                    onSelect={(emoji) => setCaption(prev => prev + emoji)}
                    trigger={
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-primary"
                      >
                        <Smile className="h-4 w-4" />
                        <span className="text-xs">{isRTL ? 'إيموجي' : 'Emoji'}</span>
                      </Button>
                    }
                  />
                </div>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={isRTL ? 'اكتب شيئاً رائعاً...' : 'Write something amazing...'}
                  className="min-h-32 bg-muted/50 border-border/50 focus:border-primary rounded-xl resize-none"
                  data-testid="input-caption"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {caption.length}/2200
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2 flex-col sm:flex-row">
                <Button
                  onClick={handlePost}
                  className="flex-1 h-10 sm:h-11 gradient-primary hover:opacity-90 rounded-xl font-semibold text-sm sm:text-base"
                  disabled={!caption.trim() || isUploading || createPostMutation.isPending}
                  data-testid="button-post"
                >
                  {isUploading || createPostMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">{isUploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'جاري النشر...' : 'Posting...')}</span>
                      <span className="sm:hidden">{isUploading ? (isRTL ? 'رفع...' : 'Up...') : (isRTL ? 'نشر...' : 'Post...')}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{isRTL ? 'نشر منشور' : 'Share Post'}</span>
                      <span className="sm:hidden">{isRTL ? 'نشر' : 'Share'}</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl text-sm sm:text-base"
                  onClick={() => {
                    setCaption("");
                    handleRemoveMedia();
                    setLocation("/");
                  }}
                  data-testid="button-cancel"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-6 p-4 bg-muted/30 rounded-2xl border border-border/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {isRTL ? 'نصائح لمنشور رائع' : 'Tips for a great post'}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {isRTL ? 'استخدم صور أو فيديوهات عالية الجودة' : 'Use high-quality images or videos'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {isRTL ? 'اكتب وصفاً جذاباً يروي قصة' : 'Write engaging captions that tell a story'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {isRTL ? 'استخدم هاشتاقات ذات صلة للوصول لأكبر عدد' : 'Use relevant hashtags to reach more people'}
              </li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
