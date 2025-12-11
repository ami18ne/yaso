import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "./VerifiedBadge";
import ImageLightbox from "./ImageLightbox";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  hasStory?: boolean;
  hasUnseenStory?: boolean;
  isVerified?: boolean;
  showVerifiedBadge?: boolean;
  onClick?: () => void;
  clickToView?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-24 w-24",
};

const ringMap = {
  xs: "p-[2px]",
  sm: "p-[2px]",
  md: "p-[2px]",
  lg: "p-[2.5px]",
  xl: "p-[3px]",
  "2xl": "p-[3px]",
};

const textSizeMap = {
  xs: "text-[8px]",
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-lg",
  "2xl": "text-2xl",
};

const badgeSizeMap = {
  xs: "xs" as const,
  sm: "xs" as const,
  md: "sm" as const,
  lg: "sm" as const,
  xl: "md" as const,
  "2xl": "lg" as const,
};

export default function UserAvatar({
  src,
  name,
  size = "md",
  hasStory = false,
  hasUnseenStory = false,
  isVerified = false,
  showVerifiedBadge = true,
  onClick,
  clickToView = false,
  className,
}: UserAvatarProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const initials = name?.slice(0, 2).toUpperCase() || "??";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (clickToView && src) {
      setLightboxOpen(true);
    }
  };

  const avatarContent = (
    <div className={cn("relative inline-flex", className)}>
      {hasStory ? (
        <div
          className={cn(
            "rounded-full",
            ringMap[size],
            hasUnseenStory
              ? "bg-gradient-to-br from-primary via-purple-500 to-pink-500"
              : "bg-muted-foreground/30"
          )}
        >
          <Avatar
            className={cn(
              sizeMap[size],
              "border-2 border-background cursor-pointer transition-transform hover:scale-105"
            )}
          >
            <AvatarImage src={src || undefined} alt={name} className="object-cover" />
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br from-primary to-purple-600 text-white font-semibold",
                textSizeMap[size]
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <Avatar
          className={cn(
            sizeMap[size],
            "ring-2 ring-border/50 cursor-pointer transition-transform hover:scale-105"
          )}
        >
          <AvatarImage src={src || undefined} alt={name} className="object-cover" />
          <AvatarFallback
            className={cn(
              "bg-gradient-to-br from-primary to-purple-600 text-white font-semibold",
              textSizeMap[size]
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      {isVerified && showVerifiedBadge && (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5",
            size === "xs" && "hidden"
          )}
        >
          <VerifiedBadge size={badgeSizeMap[size]} />
        </div>
      )}
    </div>
  );

  if (onClick || clickToView) {
    return (
      <>
        <button onClick={handleClick} className="focus:outline-none">
          {avatarContent}
        </button>
        {clickToView && src && (
          <ImageLightbox
            src={src}
            alt={name}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  return avatarContent;
}
