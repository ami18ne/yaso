import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, MapPin, Calendar, Users, Video, MessageCircle } from "lucide-react";
import { logger } from "@/lib/logger";

interface ProfilePageProps {
  user: {
    name: string;
    username: string;
    avatar?: string;
    bio: string;
    location: string;
    joinDate: string;
    followersCount: number;
    followingCount: number;
    videosCount: number;
    isOnline: boolean;
  };
  onEditProfile?: () => void;
}

export default function ProfilePage({ user, onEditProfile }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 neon-glow-strong">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20">
        <Card className="border-primary/30 neon-glow">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary neon-glow-strong">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-white text-3xl neon-text">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-status-online border-4 border-card neon-glow" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="text-profile-name">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                <p className="text-sm max-w-2xl">{user.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" strokeWidth={2} />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" strokeWidth={2} />
                    <span>Joined {user.joinDate}</span>
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <div>
                    <span className="font-semibold text-lg">{user.followersCount}</span>
                    <span className="text-muted-foreground text-sm ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold text-lg">{user.followingCount}</span>
                    <span className="text-muted-foreground text-sm ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold text-lg">{user.videosCount}</span>
                    <span className="text-muted-foreground text-sm ml-1">Videos</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onEditProfile}
                  variant="outline"
                  className="neon-glow hover-elevate"
                  data-testid="button-edit-profile"
                >
                  <Edit className="h-4 w-4 mr-2" strokeWidth={2} />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:neon-text"
                  data-testid="tab-videos"
                >
                  <Video className="h-4 w-4 mr-2" strokeWidth={2} />
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value="chats"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:neon-text"
                  data-testid="tab-chats"
                >
                  <MessageCircle className="h-4 w-4 mr-2" strokeWidth={2} />
                  Chats
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:neon-text"
                  data-testid="tab-connections"
                >
                  <Users className="h-4 w-4 mr-2" strokeWidth={2} />
                  Connections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-[9/16] rounded-lg bg-gradient-to-br from-purple-600/30 to-black hover-elevate cursor-pointer group relative overflow-hidden"
                      onClick={() => logger.debug(`Video ${i} clicked`)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl neon-text">🎬</div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 500 + 100)}K views
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chats" className="mt-6">
                <p className="text-center text-muted-foreground py-8">
                  Recent chat history will appear here
                </p>
              </TabsContent>

              <TabsContent value="connections" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Sarah Johnson", username: "sarahj", mutual: 12 },
                    { name: "Mike Chen", username: "mikec", mutual: 8 },
                    { name: "Alex Rivera", username: "alexr", mutual: 15 },
                    { name: "Emma Davis", username: "emmad", mutual: 6 },
                  ].map((connection) => (
                    <Card key={connection.username} className="hover-elevate cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {connection.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{connection.name}</h4>
                            <p className="text-sm text-muted-foreground">@{connection.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{connection.mutual} mutual</p>
                            <Button size="sm" variant="outline" className="mt-1">
                              Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
