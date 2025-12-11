import { useState } from 'react'
import { useLocation } from 'wouter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Mic, X, Heart, Smile } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import VoiceRecorder from './VoiceRecorder'
import VoiceMessage from './VoiceMessage'
import ReactionPicker from './ReactionPicker'
import EmojiPicker from './EmojiPicker'
import { cn } from '@/lib/utils'
import { uploadVoiceComment } from '@/lib/storage'

interface Comment {
  id: string
  user: {
    name: string
    username: string
    avatar?: string
  }
  content: string
  timestamp: string
  isVoice?: boolean
  voiceUrl?: string
  voiceDuration?: number
  reactions?: { emoji: string; count: number }[]
}

interface CommentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  comments: Comment[]
  onAddComment?: (content: string, isVoice?: boolean, audioBlob?: Blob) => Promise<void> | void
}

export default function CommentsDialog({
  open,
  onOpenChange,
  postId,
  comments,
  onAddComment,
}: CommentsDialogProps) {
  const [newComment, setNewComment] = useState('')
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      })
      return
    }

    if (onAddComment) {
      try {
        await onAddComment(newComment, false)
        setNewComment('')
      } catch (error) {
        logger.error('Failed to post comment:', error)
      }
    } else {
      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      })
      setNewComment('')
    }
  }

  const handleVoiceComment = async (audioBlob: Blob, duration: number) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to add voice comments',
        variant: 'destructive',
      })
      return
    }

    try {
      const uploadResult = await uploadVoiceComment(audioBlob, user.id)
      
      if (onAddComment) {
        await onAddComment(uploadResult.url, true, audioBlob)
      }
      
      setShowVoiceRecorder(false)
      toast({
        title: 'Voice comment added!',
        description: 'Your voice comment has been posted.',
      })
    } catch (error) {
      logger.error('Failed to post voice comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload voice comment',
        variant: 'destructive',
      })
    }
  }

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleReaction = (commentId: string, emoji: string) => {
    toast({
      title: 'Reaction added',
      description: `You reacted with ${emoji}`,
    })
    setActiveReactionPicker(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/30 neon-glow max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="neon-text text-lg">Comments</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="flex gap-3 transition-all duration-200 hover:bg-primary/5 rounded-lg p-2 -mx-2 group"
                >
                  <button onClick={() => setLocation(`/profile/${comment.user.username}`)}>
                    <Avatar className="h-8 w-8 border-2 border-primary/20 cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105">
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-semibold">
                        {comment.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        className="font-semibold text-sm hover:underline transition-colors"
                        onClick={() => setLocation(`/profile/${comment.user.username}`)}
                      >
                        {comment.user.username}
                      </button>
                      <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    
                    {(comment.isVoice && comment.voiceUrl) || 
                     (comment.content && (comment.content.includes('supabase') || comment.content.includes('.mp3') || comment.content.includes('.webm') || comment.content.includes('.ogg') || comment.content.includes('/voice-comments/'))) ? (
                      <VoiceMessage
                        audioUrl={comment.voiceUrl || comment.content}
                        duration={comment.voiceDuration || 0}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="relative">
                        <button 
                          className={cn(
                            "text-xs flex items-center gap-1 transition-colors",
                            likedComments.has(comment.id) 
                              ? "text-red-500" 
                              : "text-muted-foreground hover:text-red-500"
                          )}
                          onClick={() => handleLikeComment(comment.id)}
                          onMouseEnter={() => setActiveReactionPicker(comment.id)}
                        >
                          <Heart 
                            className={cn(
                              "h-3.5 w-3.5",
                              likedComments.has(comment.id) && "fill-current"
                            )} 
                          />
                          Like
                        </button>
                        
                        <ReactionPicker
                          isOpen={activeReactionPicker === comment.id}
                          onReaction={(emoji) => handleReaction(comment.id, emoji)}
                          onClose={() => setActiveReactionPicker(null)}
                        />
                      </div>
                      
                      <button 
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        onClick={() => {
                          setNewComment(`@${comment.user.username} `);
                        }}
                      >
                        <MessageCircle className="h-3 w-3" strokeWidth={2} />
                        Reply
                      </button>
                    </div>
                    
                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {comment.reactions.map((reaction, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-muted/50 px-1.5 py-0.5 rounded-full"
                          >
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-semibold">No comments yet</p>
                <p className="text-sm mt-1">Be the first to comment!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-4 py-3 border-t border-border bg-card/95 backdrop-blur">
          {showVoiceRecorder ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Record voice comment</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setShowVoiceRecorder(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <VoiceRecorder
                onRecordingComplete={handleVoiceComment}
                onCancel={() => setShowVoiceRecorder(false)}
                maxDuration={60}
              />
            </div>
          ) : (
            <div className="flex gap-3 items-end">
              {user && (
                <Avatar className="h-8 w-8 border-2 border-primary/20 transition-all duration-200 hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-semibold">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1 resize-none border-primary/30 focus:border-primary bg-background transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSubmit()
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <EmojiPicker
                  onSelect={(emoji) => setNewComment(prev => prev + emoji)}
                  trigger={
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 border-primary/30 hover:bg-primary/10"
                      title="Add emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-primary/30 hover:bg-primary/10"
                  onClick={() => setShowVoiceRecorder(true)}
                  title="Voice comment"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="neon-glow-strong hover-elevate transition-all duration-200"
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
