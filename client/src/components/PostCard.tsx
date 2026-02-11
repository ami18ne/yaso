import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useAddComment, useComments } from '@/hooks/useComments'
import { useLikePost, useSavePost } from '@/hooks/usePosts'
import { ErrorLogger } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import CommentsDialog from './CommentsDialog'
import DoubleTapLike from './DoubleTapLike'
import EditPostDialog from './EditPostDialog'
import ImageLightbox from './ImageLightbox'
import OptimizedImage from './OptimizedImage'
import PostOptionsMenu from './PostOptionsMenu'
import ShareDialog from './ShareDialog'
import UserAvatar from './UserAvatar'
import VerifiedBadge from './VerifiedBadge'
interface PostCardProps {
  id: string
  userId: string
  user: {
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
  }
  image?: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  isLiked?: boolean
  isSaved?: boolean
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
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const likePostMutation = useLikePost()
  const savePostMutation = useSavePost()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const { data: commentsData = [] } = useComments(id)
  const addCommentMutation = useAddComment()
  const [, setLocation] = useLocation()

  useEffect(() => {
    setLiked(isLiked)
    setSaved(isSaved)
  }, [isLiked, isSaved])

  const handleLike = useCallback(async () => {
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      })
      setLocation('/auth')
      return
    }

    if (isLiking) return

    setIsLiking(true)
    const previousLiked = liked
    const previousLikes = likes

    setLiked(!previousLiked)
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1)

    try {
      await likePostMutation.mutateAsync({ postId: id, isLiked: previousLiked })
    } catch (error) {
      setLiked(previousLiked)
      setLikes(previousLikes)
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      })
    } finally {
      setIsLiking(false)
    }
  }, [currentUser, isLiking, liked, likes, id, likePostMutation, toast, setLocation])

  const handleDoubleTapLike = useCallback(() => {
    if (!liked) {
      handleLike()
    }
  }, [liked, handleLike])

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save posts',
        variant: 'destructive',
      })
      setLocation('/auth')
      return
    }

    if (isSaving) return

    setIsSaving(true)
    const previousSaved = saved

    setSaved(!previousSaved)

    try {
      await savePostMutation.mutateAsync({ postId: id, isSaved: previousSaved })
    } catch (error) {
      setSaved(previousSaved)
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async (content: string) => {
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      })
      setLocation('/auth')
      return
    }
    await addCommentMutation.mutateAsync({ postId: id, content })
  }

  return (
    <motion.article
      className="w-full py-6"
      data-testid="post-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-4 py-0 flex items-center justify-between">
        <motion.button
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => setLocation(`/profile/${user.username}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
              <h3 className="font-semibold text-sm hover:text-primary transition-colors">
                {user.username}
              </h3>
              {user.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                try {
                  const d = new Date(timestamp)
                  if (!timestamp || isNaN(d.getTime())) return 'تاريخ غير معروف'
                  return formatDistanceToNow(d, { addSuffix: true })
                } catch {
                  return 'تاريخ غير معروف'
                }
              })()}
            </p>
          </div>
        </motion.button>
        <PostOptionsMenu
          postId={id}
          imageUrl={image}
          isOwnPost={currentUser?.id === userId}
          onEdit={() => setEditOpen(true)}
        />
      </div>

      {image ? (
        <DoubleTapLike onDoubleTap={handleDoubleTapLike} disabled={!currentUser}>
          <div
            className="relative w-full aspect-square overflow-hidden cursor-zoom-in rounded-lg hover-lift"
            onClick={() => setLightboxOpen(true)}
            style={{ background: 'transparent' }}
          >
            <OptimizedImage
              src={image}
              alt={caption}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </DoubleTapLike>
      ) : (
        <DoubleTapLike onDoubleTap={handleDoubleTapLike} disabled={!currentUser}>
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 flex items-center justify-center p-4">
            <p className="text-lg font-medium text-center px-4 leading-relaxed max-w-prose">
              {caption}
            </p>
          </div>
        </DoubleTapLike>
      )}

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleLike}
              className="group transition-transform"
              disabled={isLiking}
              data-testid="button-like-post"
              aria-label={liked ? 'Unlike' : 'Like'}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={cn(
                    'h-6 w-6 transition-all duration-200',
                    liked
                      ? 'text-red-500 fill-red-500'
                      : 'text-foreground group-hover:text-red-500'
                  )}
                />
              </motion.div>
            </motion.button>
            <motion.button
              className="group transition-transform"
              onClick={() => setCommentsDialogOpen(true)}
              data-testid="button-comment-post"
              aria-label="Comment"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="h-6 w-6 transition-colors group-hover:text-primary" />
            </motion.button>
            <motion.button
              className="group transition-transform"
              onClick={() => setShareDialogOpen(true)}
              data-testid="button-share-post"
              aria-label="Share"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="h-6 w-6 transition-colors group-hover:text-primary" />
            </motion.button>
          </div>
          <motion.button
            onClick={handleSave}
            className="group transition-transform"
            disabled={isSaving}
            data-testid="button-save-post"
            aria-label={saved ? 'Unsave' : 'Save'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={saved ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bookmark
                className={cn(
                  'h-6 w-6 transition-all duration-200',
                  saved
                    ? 'text-primary fill-primary'
                    : 'text-foreground group-hover:text-primary'
                )}
              />
            </motion.div>
          </motion.button>
        </div>

        <div className="space-y-1.5">
          <motion.p
            className="font-semibold text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={likes}
          >
            {likes.toLocaleString()} likes
          </motion.p>

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
            <motion.button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setCommentsDialogOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View all {comments} comments
            </motion.button>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-[rgba(255,255,255,0.03)] my-6" />

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
        comments={commentsData.map((comment) => ({
          id: comment.id,
          user: {
            name: comment.profiles.full_name || comment.profiles.username,
            username: comment.profiles.username,
            avatar: comment.profiles.avatar_url || undefined,
          },
          content: comment.content,
          timestamp: (() => {
            try {
              const d = new Date(comment.created_at)
              if (!comment.created_at || isNaN(d.getTime())) return 'تاريخ غير معروف'
              return formatDistanceToNow(d, { addSuffix: true })
            } catch {
              return 'تاريخ غير معروف'
            }
          })(),
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

      <EditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        postId={id}
        initialContent={caption}
        initialImage={image}
      />
    </motion.article>
  )
}
