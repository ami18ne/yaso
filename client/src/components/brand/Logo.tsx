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
  animated = false 
}: LogoProps) {
  const sizes = sizeMap[size]
  
  const BuzlyBee = () => (
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
        <linearGradient id="beeMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7"/>
          <stop offset="50%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
        <linearGradient id="beeBody" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#FBBF24"/>
        </linearGradient>
        <linearGradient id="beeWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
      
      <rect width="48" height="48" rx="12" fill="url(#beeMain)"/>
      
      <ellipse cx="15" cy="18" rx="6" ry="8" fill="url(#beeWing)" transform="rotate(-20 15 18)"/>
      <ellipse cx="33" cy="18" rx="6" ry="8" fill="url(#beeWing)" transform="rotate(20 33 18)"/>
      
      <ellipse cx="24" cy="28" rx="11" ry="13" fill="url(#beeBody)"/>
      <rect x="21" y="16" width="6" height="10" rx="3" fill="url(#beeBody)"/>
      
      <line x1="19" y1="24" x2="29" y2="24" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="29" x2="30" y2="29" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19" y1="34" x2="29" y2="34" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round"/>
      
      <circle cx="21" cy="19" r="2" fill="#1F1F1F"/>
      <circle cx="27" cy="19" r="2" fill="#1F1F1F"/>
      <circle cx="21.5" cy="18.5" r="0.8" fill="white"/>
      <circle cx="27.5" cy="18.5" r="0.8" fill="white"/>
      
      <line x1="18" y1="12" x2="16" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15.5" cy="7" r="1.5" fill="white"/>
      <line x1="30" y1="12" x2="32" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="32.5" cy="7" r="1.5" fill="white"/>
    </svg>
  )
  
  const LogoText = () => (
    <span 
      className={cn(
        sizes.text,
        'font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent',
        animated && 'transition-all duration-300 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500'
      )}
    >
      Buzly
    </span>
  )
  
  if (variant === 'icon') {
    return <BuzlyBee />
  }
  
  if (variant === 'text') {
    return <LogoText />
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <BuzlyBee />
      <LogoText />
    </div>
  )
}
