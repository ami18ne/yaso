import React, { useEffect, useState, useCallback } from "react";
import { Home, Video, Users, MessageCircle, Bell, ChevronLeft, ChevronRight, PlusCircle, Search } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfiles";
import { useRTL } from "@/hooks/useRTL";

const COLLAPSED_WIDTH = '80px';
const EXPANDED_WIDTH = '260px';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('sidebar.collapsed');
      return v === '1';
    } catch (e) {
      return false;
    }
  });
  const isRTL = useRTL();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const applyCssWidth = useCallback((isCollapsed: boolean) => {
    const width = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, []);

  useEffect(() => {
    applyCssWidth(collapsed);
    try { localStorage.setItem('sidebar.collapsed', collapsed ? '1' : '0'); } catch (e) {}
  }, [collapsed, applyCssWidth]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <aside
      aria-expanded={!collapsed}
      className={cn(
        'fixed left-0 top-0 h-screen z-40 p-3 glass-sidebar flex flex-col gap-3 transition-all duration-200 ease-out',
      )}
      role="navigation"
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      <div className="flex items-center gap-2">
        <img 
          src="/tinar_logo.svg" 
          loading="eager"
          alt="Logo"
          className="h-12 w-12 object-contain"
        />
      </div>

      {!collapsed && (
        <div className="mt-4">
          <Link href="/search">
            <div className={`relative group ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
              <Search className={`absolute h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <Input
                placeholder={isRTL ? "ابحث..." : "Search..."}
                className={`h-8 ${isRTL ? 'pr-9 text-right' : 'pl-9 text-left'} bg-muted/50 border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all cursor-pointer w-full`}
                dir={isRTL ? 'rtl' : 'ltr'}
                readOnly
              />
            </div>
          </Link>
        </div>
      )}

      <nav className="flex flex-col gap-2 mt-2">
        {(() => {
          const [location] = useLocation();
          const items = [
            { href: '/home', icon: Home, label: 'T-Feed' },
            { href: '/messages', icon: MessageCircle, label: 'T-Direct' },
            { href: '/communities', icon: Users, label: 'T-Realms' },
            { href: '/', icon: Video, label: 'T-Shorts' },
            { href: '/create', icon: PlusCircle, label: 'T-Studio' },
            { href: '/notifications', icon: Bell, label: 'Notifications' },
          ];

          return items.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || location.startsWith(href + '/');
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'group flex items-center gap-3 justify-start w-full px-2 py-1 rounded-md',
                    isActive ? 'bg-[rgba(255,107,0,0.12)]' : 'hover:bg-[rgba(255,255,255,0.02)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={cn('relative flex items-center justify-center h-8 w-8 rounded', isActive ? 'text-[rgb(255,107,0)]' : 'text-foreground') }>
                    <Icon className={cn('h-5 w-5', isActive ? 'text-[rgb(255,107,0)]' : '')} />
                  </div>
                  {!collapsed && (
                    <span className={cn('text-sm', isActive ? 'text-[rgb(255,107,0)]' : 'text-foreground/90')}>
                      <span className="group-hover:text-[#FF4500] group-hover:font-bold transition-all group-hover:drop-shadow-[0_0_5px_#FF4500]">{label.slice(0, 1)}</span>
                      <span className="group-hover:text-white transition-colors">{label.slice(1)}</span>
                    </span>
                  )}
                  {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r bg-[rgb(255,107,0)]" />}
                </Button>
              </Link>
            );
          });
        })()}
      </nav>

      <div className="mt-auto mb-3 flex items-center gap-2">
        <Link href="/profile">
          <Avatar className="h-8 w-8 ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "Profile"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
              {profile?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'ME'}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(s => !s)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
        </Button>
      </div>
    </aside>
  );
}
