import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTrendingHashtags } from '@/hooks/useHashtags'
import {
  useFollowUser,
  useIsFollowing,
  useSearchProfiles,
  useSuggestedProfiles,
} from '@/hooks/useProfiles'
import { useRTL } from '@/hooks/useRTL'
import { logger } from '@/lib/logger'
import { Hash, Search as SearchIcon, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const isRTL = useRTL()

  const { data: searchResults, isLoading: searchLoading } = useSearchProfiles(searchQuery)
  const { data: suggestedUsers, isLoading: suggestedLoading } = useSuggestedProfiles()
  const { data: trendingHashtags, isLoading: hashtagsLoading } = useTrendingHashtags()
  const followMutation = useFollowUser()

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    await followMutation.mutateAsync({ userId, isFollowing })
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
          <div className="relative group">
            <SearchIcon
              className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary`}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن المستخدمين، الهاشتاق...' : 'Search users, hashtags...'}
              className={`h-12 ${isRTL ? 'pr-12 text-right' : 'pl-12'} bg-muted/50 border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base transition-all`}
              dir={isRTL ? 'rtl' : 'ltr'}
              data-testid="input-search-page"
            />
          </div>

          {searchQuery ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{isRTL ? 'المستخدمين' : 'Users'}</span>
              </div>
              {searchLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 animate-pulse"
                    >
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <UserCard key={user.id} user={user} onFollow={handleFollow} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">
                    {isRTL
                      ? `لا يوجد مستخدمين بهذا الاسم "${searchQuery}"`
                      : `No users found for "${searchQuery}"`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-semibold">{isRTL ? 'الأكثر رواجاً' : 'Trending'}</h2>
                </div>
                {hashtagsLoading ? (
                  <div className="grid gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
                    ))}
                  </div>
                ) : trendingHashtags && trendingHashtags.length > 0 ? (
                  <div className="grid gap-2">
                    {trendingHashtags.map((item, index) => (
                      <Card
                        key={item.id}
                        className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-muted/50 cursor-pointer transition-all duration-200 rounded-2xl group"
                        onClick={() => logger.debug(`Hashtag clicked: ${item.name}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                              <Hash className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                #{item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {formatCount(item.posts_count)} {isRTL ? 'منشور' : 'posts'}
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-muted-foreground/30">
                            {index + 1}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {isRTL ? 'لا توجد هاشتاقات رائجة حالياً' : 'No trending hashtags yet'}
                  </p>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-semibold">{isRTL ? 'مقترحون لك' : 'Suggested For You'}</h2>
                </div>
                {suggestedLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 animate-pulse"
                      >
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-muted rounded" />
                          <div className="h-3 w-16 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestedUsers && suggestedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {suggestedUsers.slice(0, 5).map((user) => (
                      <UserCard key={user.id} user={user} onFollow={handleFollow} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {isRTL ? 'لا توجد اقتراحات حالياً' : 'No suggestions yet'}
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function UserCard({
  user,
  onFollow,
}: {
  user: any
  onFollow: (userId: string, isFollowing: boolean) => void
}) {
  const { data: isFollowing, isLoading } = useIsFollowing(user.id)
  const followMutation = useFollowUser()
  const [, setLocation] = useLocation()
  const isRTL = useRTL()

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-muted/30 transition-all duration-200 rounded-2xl">
      <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          className={`flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity ${isRTL ? 'flex-row-reverse text-right' : ''}`}
          onClick={() => setLocation(`/profile/${user.username}`)}
        >
          <Avatar className="h-12 w-12 ring-2 ring-border/50">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white">
              {(user.full_name || user.username).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold truncate hover:text-primary transition-colors">
              {user.username}
            </h3>
            {user.full_name && (
              <p className="text-sm text-muted-foreground truncate">{user.full_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatCount(user.followers_count)} {isRTL ? 'متابع' : 'followers'}
            </p>
          </div>
        </button>
        <Button
          size="sm"
          className={`rounded-xl px-4 flex-shrink-0 ${
            isFollowing
              ? 'bg-muted text-foreground hover:bg-muted/80'
              : 'gradient-primary hover:opacity-90'
          }`}
          onClick={() => onFollow(user.id, isFollowing || false)}
          disabled={isLoading || followMutation.isPending}
        >
          {isFollowing ? (isRTL ? 'متابَع' : 'Following') : isRTL ? 'متابعة' : 'Follow'}
        </Button>
      </div>
    </Card>
  )
}
