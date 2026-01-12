import React, { useEffect, useState, useCallback } from "react";
import { Home, Video, Users, MessageCircle, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <div className={cn('h-10 w-10 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center', collapsed ? '' : 'mr-2')}>
          B
        </div>
        {!collapsed && <div className="text-lg font-semibold">Buzly</div>}
      </div>
      <nav className="flex flex-col gap-2 mt-2">
        {(() => {
          const [location] = useLocation();
          const items = [
            { href: '/home', icon: Home, label: 'Dashboard' },
            { href: '/analytics', icon: Video, label: 'Analytics' },
            { href: '/projects', icon: Users, label: 'Projects' },
            { href: '/team', icon: MessageCircle, label: 'Team' },
            { href: '/billing', icon: Bell, label: 'Billing' },
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
                  {!collapsed && <span className={cn('text-sm', isActive ? 'text-[rgb(255,107,0)]' : 'text-foreground/90')}>{label}</span>}
                  {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r bg-[rgb(255,107,0)]" />}
                </Button>
              </Link>
            );
          });
        })()}
      </nav>

      <div className="mt-auto mb-3 flex items-center gap-2">
        <Button variant="outline" size="sm" className="w-12">+</Button>
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
