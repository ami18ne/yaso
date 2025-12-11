import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ImageOff, Clock, TrendingUp } from "lucide-react";
import { isVerifiedUser } from "@/lib/verifiedUsers";

type SortType = 'recent' | 'popular';

export default function Home() {
  const { data: posts, isLoading, error } = usePosts();
  const [sortBy, setSortBy] = useState<SortType>('recent');

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    
    return [...posts].sort((a, b) => {
      if (sortBy === 'popular') {
        const aScore = (a.likes_count || 0) + (a.comments_count || 0) * 2;
        const bScore = (b.likes_count || 0) + (b.comments_count || 0) * 2;
        return bScore - aScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Unable to load posts</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-8">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => setSortBy('recent')}
              >
                <Clock className="h-4 w-4" />
                Recent
              </Button>
              <Button
                variant={sortBy === 'popular' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => setSortBy('popular')}
              >
                <TrendingUp className="h-4 w-4" />
                Popular
              </Button>
            </div>
          </div>

          {sortedPosts && sortedPosts.length > 0 ? (
            <div className="space-y-4 md:space-y-6 md:p-4">
              {sortedPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="animate-slide-up md:rounded-2xl md:overflow-hidden md:border md:border-border/30 md:bg-card/50 md:backdrop-blur-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                    timestamp={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    isLiked={post.is_liked}
                    isSaved={post.is_saved}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 px-4">
              <div className="text-center space-y-4 max-w-sm animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold">Your feed is empty</h3>
                <p className="text-muted-foreground">
                  Follow people and create posts to see content here!
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
