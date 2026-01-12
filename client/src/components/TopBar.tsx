import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, MessageCircle, PlusCircle, Search, Bell, Video, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfiles";
import { useRTL } from "@/hooks/useRTL";
import buzlyLogo from "@assets/buzly_1764443414587.png";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isRTL = useRTL();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-[rgba(255,255,255,0.06)]">
      <div className="container mx-auto px-4">
        <div className={`flex h-14 md:h-16 items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <Link href="/home">
            <div className={`flex items-center gap-2 cursor-pointer group ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <img 
                src={buzlyLogo} 
                loading="eager"
                alt="Buzly" 
                className="h-8 w-8 md:h-9 md:w-9 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent hidden sm:inline">
                Buzly
              </span>
            </div>
          </Link>

          <Link href="/search" className="hidden md:block">
            <div className={`relative w-64 lg:w-80 group ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
              <Search className={`absolute h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
              <Input
                placeholder={isRTL ? "ابحث..." : "Search..."}
                className={`h-10 ${isRTL ? 'pr-11 text-right' : 'pl-11 text-left'} bg-muted/50 border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all cursor-pointer`}
                dir={isRTL ? 'rtl' : 'ltr'}
                readOnly
                data-testid="input-search"
              />
            </div>
          </Link>

          <div className={`flex items-center gap-1 md:gap-1.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Link href="/home">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "hidden md:flex h-10 w-10 rounded-full transition-colors",
                  location === "/home" ? "bg-muted text-primary" : "hover:bg-muted/80"
                )}
                data-testid="button-home"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/messages">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors",
                  location === "/messages" || location.startsWith("/messages") ? "bg-muted text-primary" : "hover:bg-muted/80"
                )}
                data-testid="button-messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/communities">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "hidden md:flex h-10 w-10 rounded-full transition-colors",
                  location === "/communities" ? "bg-muted text-primary" : "hover:bg-muted/80"
                )}
                data-testid="button-communities"
              >
                <Users className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "hidden md:flex h-10 w-10 rounded-full transition-colors",
                  location === "/" || location === "/videos" ? "bg-muted text-primary" : "hover:bg-muted/80"
                )}
                data-testid="button-videos"
              >
                <Video className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/create">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "hidden md:flex h-10 w-10 rounded-full transition-colors",
                  location === "/create" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-primary"
                )}
                data-testid="button-create"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/notifications">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10 rounded-full transition-colors relative",
                  location === "/notifications" ? "bg-muted text-primary" : "hover:bg-muted/80"
                )}
                data-testid="button-notifications-nav"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/profile">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "Profile"} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs md:text-sm font-semibold">
                  {profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'ME'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
