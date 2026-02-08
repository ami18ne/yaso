import OptimizedImage from '@/components/OptimizedImage'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities'
import { ErrorLogger } from '@/lib/errorHandler'
import { LogIn, Users } from 'lucide-react'
import React from 'react'
import { useLocation } from 'wouter'

export default function CommunityCard({
  community,
  isMember,
}: { community: any; isMember: boolean }) {
  const joinMutation = useJoinCommunity()
  const leaveMutation = useLeaveCommunity()
  const { user } = useAuth()
  const [, setLocation] = useLocation()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleNavigation = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    setLocation(`/communities/${community.id}`)
  }

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
    if (!user) return alert('Please sign in to join communities')
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await joinMutation.mutateAsync({ communityId: community.id })
      // Optional: Show a success toast
    } catch (err) {
      ErrorLogger.log('Join error', err)
      // Optional: Show an error toast
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
    if (!user) return alert('Please sign in to leave communities')
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await leaveMutation.mutateAsync({ communityId: community.id })
      // Optional: Show a success toast
    } catch (err) {
      ErrorLogger.log('Leave error', err)
      // Optional: Show an error toast
    } finally {
      setIsProcessing(false)
    }
  }

  const bannerUrl =
    community.banner_url ||
    `https://source.unsplash.com/random/400x200?community&sig=${community.id}`

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleNavigation}
    >
      <div className="relative h-28 bg-muted">
        <OptimizedImage
          src={bannerUrl}
          alt={`${community.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-4">
        <h4 className="text-lg font-bold truncate text-card-foreground">{community.name}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 h-10 my-2">
          {community.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{community.members_count || 0} members</span>
          </div>

          {isMember ? (
            <Button
              onClick={handleLeave}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="px-3"
            >
              {isProcessing ? 'Leaving...' : 'Leave'}
            </Button>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isProcessing}
              size="sm"
              className="px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isProcessing ? 'Joining...' : 'Join'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
