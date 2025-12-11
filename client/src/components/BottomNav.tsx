import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: PlusCircle, label: "Create", path: "/create", isCreate: true },
    { icon: Video, label: "Videos", path: "/" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px]",
                  item.isCreate && "px-2",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.isCreate ? (
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white glow-sm" 
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                ) : (
                  <>
                    <Icon 
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "h-6 w-6" : "h-5 w-5"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={cn(
                      "text-[10px] font-medium transition-all",
                      isActive && "text-primary"
                    )}>
                      {item.label}
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
