import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { useComments, useAddComment } from "@/hooks/useComments";
import ShareDialog from "./ShareDialog";
import CommentsDialog from "./CommentsDialog";
import PostOptionsMenu from "./PostOptionsMenu";
import ImageLightbox from "./ImageLightbox";
import UserAvatar from "./UserAvatar";
import VerifiedBadge from "./VerifiedBadge";
import DoubleTapLike from "./DoubleTapLike";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
  };
  image?: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function PostCard({
  id,
  userId,
  user,
  image,
  caption,
  likes: initialLikes,
  comments,
  timestamp,
  isLiked = false,
  isSaved = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { data: commentsData = [] } = useComments(id);
  const addCommentMutation = useAddComment();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLiked(isLiked);
    setSaved(isSaved);
  }, [isLiked, isSaved]);

  const handleLike = useCallback(async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }

    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = liked;
    const previousLikes = likes;
    
    setLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);
    
    try {
      await likePostMutation.mutateAsync({ postId: id, isLiked: previousLiked });
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  }, [currentUser, isLiking, liked, likes, id, likePostMutation, toast, setLocation]);

  const handleDoubleTapLike = useCallback(() => {
    if (!liked) {
      handleLike();
    }
  }, [liked, handleLike]);

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save posts",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }

    if (isSaving) return;
    
    setIsSaving(true);
    const previousSaved = saved;
    
    setSaved(!previousSaved);
    
    try {
      await savePostMutation.mutateAsync({ postId: id, isSaved: previousSaved });
    } catch (error) {
      setSaved(previousSaved);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }
    await addCommentMutation.mutateAsync({ postId: id, content });
  };

  return (
    <article className="w-full bg-card/50 backdrop-blur-sm border-b border-border/30 animate-fade-in" data-testid="post-card">
      <div className="px-4 py-3 flex items-center justify-between">
        <button 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => setLocation(`/profile/${user.username}`)}
        >
          <UserAvatar
            src={user.avatar}
            name={user.name}
            size="md"
            isVerified={user.isVerified}
            showVerifiedBadge={false}
          />
          <div className="text-left">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm hover:text-primary transition-colors">{user.username}</h3>
              {user.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
        </button>
        <PostOptionsMenu
          postId={id}
          imageUrl={image}
          isOwnPost={currentUser?.id === userId}
        />
      </div>

      {image ? (
        <DoubleTapLike onDoubleTap={handleDoubleTapLike} disabled={!currentUser}>
          <div 
            className="relative w-full aspect-square bg-muted/30 overflow-hidden cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={image}
              alt={caption}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </DoubleTapLike>
      ) : (
        <DoubleTapLike onDoubleTap={handleDoubleTapLike} disabled={!currentUser}>
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 flex items-center justify-center">
            <p className="text-lg font-medium text-center px-8 leading-relaxed">{caption}</p>
          </div>
        </DoubleTapLike>
      )}

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="group transition-transform active:scale-90"
              disabled={isLiking}
              data-testid="button-like-post"
            >
              <Heart 
                className={cn(
                  "h-6 w-6 transition-all duration-200",
                  liked 
                    ? "text-red-500 fill-red-500 scale-110" 
                    : "text-foreground group-hover:text-red-500"
                )} 
              />
            </button>
            <button
              className="group transition-transform active:scale-90"
              onClick={() => setCommentsDialogOpen(true)}
              data-testid="button-comment-post"
            >
              <MessageCircle className="h-6 w-6 transition-colors group-hover:text-primary" />
            </button>
            <button
              className="group transition-transform active:scale-90"
              onClick={() => setShareDialogOpen(true)}
              data-testid="button-share-post"
            >
              <Send className="h-6 w-6 transition-colors group-hover:text-primary" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="group transition-transform active:scale-90"
            disabled={isSaving}
            data-testid="button-save-post"
          >
            <Bookmark 
              className={cn(
                "h-6 w-6 transition-all duration-200",
                saved 
                  ? "text-primary fill-primary scale-110" 
                  : "text-foreground group-hover:text-primary"
              )} 
            />
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-sm">{likes.toLocaleString()} likes</p>
          {image && caption && (
            <p className="text-sm leading-relaxed">
              <button
                className="font-semibold mr-1.5 hover:text-primary transition-colors inline-flex items-center gap-1"
                onClick={() => setLocation(`/profile/${user.username}`)}
              >
                {user.username}
                {user.isVerified && <VerifiedBadge size="xs" />}
              </button>
              <span className="text-foreground/90">{caption}</span>
            </p>
          )}
          {comments > 0 && (
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setCommentsDialogOpen(true)}
            >
              View all {comments} comments
            </button>
          )}
        </div>
      </div>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        postId={id}
        postType="post"
      />

      <CommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        postId={id}
        comments={commentsData.map(comment => ({
          id: comment.id,
          user: {
            name: comment.profiles.full_name || comment.profiles.username,
            username: comment.profiles.username,
            avatar: comment.profiles.avatar_url || undefined,
          },
          content: comment.content,
          timestamp: formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }),
        }))}
        onAddComment={handleAddComment}
      />

      {image && (
        <ImageLightbox
          src={image}
          alt={caption}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </article>
  );
}
