import PostCard from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/contexts/ThemeContext'
import { usePosts } from '@/hooks/usePosts'
import { isVerifiedUser } from '@/lib/verifiedUsers'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ImageOff, Loader2, Moon, Sun } from 'lucide-react'
import { Fragment, useMemo } from 'react'

export default function Home() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts()
  const { theme, setTheme } = useTheme()

  const posts = useMemo(() => data?.pages.flat() ?? [], [data])

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary" />
        </motion.div>
        <motion.p
          className="text-muted-foreground font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading your feed...
        </motion.p>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center h-full p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4 max-w-sm">
          <motion.div
            className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ImageOff className="w-8 h-8 text-destructive" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">Unable to load posts</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-8">
          <motion.div
            className="flex justify-between items-center p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              T-Feed
            </motion.h1>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {posts.length > 0 ? (
            <div className="space-y-4 md:space-y-6 md:p-4">
              {posts.map((post, index) => {
                // Basic validation for post object
                if (!post || !post.id || !post.created_at || !post.profiles) {
                  console.warn('Invalid post object:', post)
                  return null
                }

                let dateObj, timestampText
                try {
                  dateObj = new Date(post.created_at)
                  if (isNaN(dateObj.getTime())) throw new Error('Invalid Date')
                  timestampText = formatDistanceToNow(dateObj, { addSuffix: true })
                } catch (e) {
                  console.warn('Could not parse date or format distance:', post.created_at)
                  timestampText = 'a while ago'
                }

                return (
                  <motion.div
                    key={post.id}
                    className="md:rounded-2xl md:overflow-hidden md:border md:border-border/30 md:bg-card/50 md:backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
                  >
                    <PostCard
                      id={post.id}
                      userId={post.user_id}
                      user={{
                        name: post.profiles.full_name || post.profiles.username,
                        username: post.profiles.username,
                        avatar: post.profiles.avatar_url || undefined,
                        isVerified: isVerifiedUser(post.profiles.username),
                      }}
                      image={post.image_url || undefined}
                      caption={post.content}
                      likes={post.likes_count || 0}
                      comments={post.comments_count || 0}
                      timestamp={timestampText}
                      isLiked={post.is_liked}
                      isSaved={post.is_saved}
                    />
                  </motion.div>
                )
              })}

              {hasNextPage && (
                <motion.div
                  className="flex justify-center p-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="default"
                      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                        </>
                      ) : (
                        'Load More Posts'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              className="flex items-center justify-center py-20 px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center space-y-4 max-w-sm">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
                <h3 className="text-xl font-semibold">Your feed is empty</h3>
                <p className="text-muted-foreground">
                  Follow people and create posts to see content here!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
