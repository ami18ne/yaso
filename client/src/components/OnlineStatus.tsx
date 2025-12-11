import { cn } from '@/lib/utils';

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function OnlineStatus({
  isOnline,
  lastSeen,
  showText = false,
  size = 'md',
  className,
}: OnlineStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full transition-colors',
            sizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'
          )}
        />
        {isOnline && (
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75',
              sizeClasses[size]
            )}
          />
        )}
      </div>
      
      {showText && (
        <span className={cn(
          'text-muted-foreground',
          textSizeClasses[size]
        )}>
          {isOnline ? 'Online' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
        </span>
      )}
    </div>
  );
}
