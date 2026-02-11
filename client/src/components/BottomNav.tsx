import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Home, PlusCircle, Search, User, Video } from 'lucide-react'
import { Link, useLocation } from 'wouter'

const BottomNavItem = ({ icon: Icon, label, path, isActive, isCreate }: any) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative"
  >
    <Link href={path}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer min-w-[56px]',
          isCreate && 'px-2',
          isActive
            ? isCreate
              ? 'text-white'
              : 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        )}
        data-testid={`nav-${label.toLowerCase()}`}
      >
        {isCreate ? (
          <motion.div
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 relative',
              isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/40'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
            whileHover={{ y: -2 }}
          >
            <Icon className="h-6 w-6" />
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Icon
                className={cn(
                  'transition-all duration-200',
                  isActive ? 'h-6 w-6' : 'h-5 w-5'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>
            <span
              className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </>
        )}
      </div>
    </Link>
    {isActive && !isCreate && (
      <motion.div
        layoutId="bottom-indicator"
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </motion.div>
)

export default function BottomNav() {
  const [location] = useLocation()

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusCircle, label: 'Create', path: '/create', isCreate: true },
    { icon: Video, label: 'Videos', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            location === item.path || (item.path !== '/' && location.startsWith(item.path))

          return (
            <BottomNavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={isActive}
              isCreate={item.isCreate}
            />
          )
        })}
      </div>
    </nav>
  )
}
