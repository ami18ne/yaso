import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
  className?: string
  animated?: boolean
}

const sizeMap = {
  sm: { icon: 'w-8 h-8', text: 'text-xl', full: 'h-8' },
  md: { icon: 'w-10 h-10', text: 'text-2xl', full: 'h-10' },
  lg: { icon: 'w-12 h-12', text: 'text-3xl', full: 'h-12' },
  xl: { icon: 'w-16 h-16', text: 'text-4xl', full: 'h-16' },
}

export default function Logo({
  size = 'md',
  variant = 'full',
  className,
  animated = false,
}: LogoProps) {
  const sizes = sizeMap[size]

  const TrillrBird = () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn(
        sizes.icon,
        animated && 'transition-transform duration-300 hover:scale-110 hover:rotate-3',
        className
      )}
    >
      <defs>
        <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx="12" fill="url(#birdGradient)" />

      <path
        d="M24 12 C 18 12 14 16 14 22 C 14 28 20 34 24 36 C 28 34 34 28 34 22 C 34 16 30 12 24 12 Z"
        fill="white"
        transform="translate(0, -2)"
      />

      <path
        d="M24 18 C 22 18 20 20 20 22 C 20 24 22 26 24 26 C 26 26 28 24 28 22 C 28 20 26 18 24 18 Z"
        fill="#A855F7"
      />

      <path
        d="M18 10 C 18 8 20 6 22 6 C 24 6 26 8 26 10 L 22 10 Z"
        fill="white"
        transform="translate(2, 0)"
      />
    </svg>
  )

  const LogoText = () => (
    <span
      className={cn(
        sizes.text,
        'font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent',
        animated &&
          'transition-all duration-300 hover:from-purple-300 hover:via-pink-300 hover:to-blue-300'
      )}
    >
      Trillr
    </span>
  )

  if (variant === 'icon') {
    return <TrillrBird />
  }

  if (variant === 'text') {
    return <LogoText />
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TrillrBird />
      <LogoText />
    </div>
  )
}
