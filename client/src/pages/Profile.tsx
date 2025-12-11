import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Share2, Heart, MessageCircle, Settings, Play, Grid3X3, Bookmark, Video } from "lucide-react";
import { useVideos } from "@/hooks/useVideos";
import { useProfile, useProfileByUsername, useFollowUser, useIsFollowing } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts, useSavedPosts } from "@/hooks/usePosts";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import ImageLightbox from "@/components/ImageLightbox";
import FollowersDialog from "@/components/FollowersDialog";
import { isVerifiedUser } from "@/lib/verifiedUsers";

export default function Profile() {
  const params = useParams();
  const username = params.username;
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const getOrCreateConversationMutation = useGetOrCreateConversation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  const { data: profileByUsername, isLoading: loadingByUsername } = useProfileByUsername(username);
  const { data: currentUserProfile, isLoading: loadingCurrentUser } = useProfile(!username ? user?.id : undefined);
  
  const profile = username ? profileByUsername : currentUserProfile;
  const profileLoading = username ? loadingByUsername : loadingCurrentUser;
  const { data: allPosts } = usePosts();
  const { data: savedPosts = [] } = useSavedPosts();
  const { data: isFollowing = false } = useIsFollowing(profile?.id || "");
  const followMutation = useFollowUser();

  const isOwnProfile = !username || user?.id === profile?.id;
  
  const userPosts = allPosts?.filter(post => post.user_id === profile?.id) || [];
  const { data: allVideos } = useVideos();
  const userVideos = allVideos?.filter(video => video.user_id === profile?.id) || [];

  const handleFollowToggle = () => {
    if (!profile) return;
    followMutation.mutate({ userId: profile.id, isFollowing });
  };

  const handleStartChat = async () => {
    if (!profile || !user) return;
    
    try {
      const { conversationId } = await getOrCreateConversationMutation.mutateAsync(profile.id);
      setLocation('/messages');
      toast({
        title: "Conversation started!",
        description: "You can now chat with this user.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${profile?.username}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-xl font-semibold">User not found</h3>
          <p className="text-muted-foreground">
            This profile doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-4xl mx-auto pb-24 md:pb-8">
          <div className="relative">
            <div className="absolute inset-0 h-32 bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/30" />
            <div className="relative px-4 sm:px-6 pt-16 sm:pt-20 pb-6 flex flex-col items-center text-center space-y-4">
              <UserAvatar
                src={profile.avatar_url}
                name={profile.username}
                size="2xl"
                clickToView
                className="ring-4 ring-background shadow-xl"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold">@{profile.username}</h1>
                  {isVerifiedUser(profile.username) && <VerifiedBadge size="md" />}
                </div>
                {profile.full_name && (
                  <p className="text-muted-foreground font-medium">{profile.full_name}</p>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed px-4">{profile.bio}</p>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4"
                >
                  <Link className="h-3.5 w-3.5" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}

              <div className="flex items-center justify-center gap-6 sm:gap-8 py-4">
                <button className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-lg sm:text-xl font-bold">{formatCount(profile.posts_count)}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </button>
                <div className="h-8 w-px bg-border" />
                <button 
                  className="text-center hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowers(true)}
                >
                  <div className="text-lg sm:text-xl font-bold">{formatCount(profile.followers_count)}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </button>
                <div className="h-8 w-px bg-border" />
                <button 
                  className="text-center hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowing(true)}
                >
                  <div className="text-lg sm:text-xl font-bold">{formatCount(profile.following_count)}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </button>
              </div>

              <div className="flex gap-2 w-full max-w-sm px-4">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-xl text-sm"
                      onClick={() => setLocation('/edit-profile')}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl flex-shrink-0"
                      onClick={handleShareProfile}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl flex-shrink-0"
                      onClick={() => setLocation('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className={`flex-1 h-10 rounded-xl text-sm ${
                        isFollowing 
                          ? "bg-muted text-foreground hover:bg-muted/80" 
                          : "gradient-primary hover:opacity-90"
                      }`}
                      onClick={handleFollowToggle}
                      disabled={followMutation.isPending}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-xl gap-2 text-sm"
                      onClick={handleStartChat}
                      disabled={getOrCreateConversationMutation.isPending}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden xs:inline">Message</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full h-12 bg-transparent border-b border-border rounded-none p-0 gap-0">
              <TabsTrigger
                value="posts"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger
                  value="saved"
                  className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {userPosts.map((post) => (
                    <button
                      key={post.id}
                      className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
                      onClick={() => post.image_url && setSelectedImage(post.image_url)}
                    >
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.content}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center p-2">
                          <p className="text-xs text-center line-clamp-3">{post.content}</p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                          <Heart className="h-4 w-4" fill="white" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                          <MessageCircle className="h-4 w-4" fill="white" />
                          <span>{post.comments_count || 0}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📷"
                  title="No posts yet"
                  description={isOwnProfile ? "Share your first post to get started!" : "This user hasn't posted anything yet."}
                />
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              {userVideos.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {userVideos.map((video) => (
                    <button
                      key={video.id}
                      className="relative aspect-[9/16] group cursor-pointer overflow-hidden bg-muted"
                      onClick={() => setLocation(`/videos`)}
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title || video.description || 'Video'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white/70" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                          <Play className="h-4 w-4" />
                          <span>{video.views_count || 0}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="🎬"
                  title="No videos yet"
                  description={isOwnProfile ? "Upload your first video!" : "This user hasn't uploaded any videos yet."}
                />
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              {savedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {savedPosts.map((post) => (
                    <button
                      key={post.id}
                      className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
                      onClick={() => post.image_url && setSelectedImage(post.image_url)}
                    >
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.content}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center p-2">
                          <p className="text-xs text-center line-clamp-3">{post.content}</p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                          <Heart className="h-4 w-4" fill="white" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="🔖"
                  title="No saved posts"
                  description="Posts you save will appear here"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {selectedImage && (
        <ImageLightbox
          src={selectedImage}
          alt="Post image"
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <FollowersDialog
        open={showFollowers}
        onOpenChange={setShowFollowers}
        userId={profile?.id || ""}
        type="followers"
        title="Followers"
      />

      <FollowersDialog
        open={showFollowing}
        onOpenChange={setShowFollowing}
        userId={profile?.id || ""}
        type="following"
        title="Following"
      />
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="text-center space-y-3 max-w-xs animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
