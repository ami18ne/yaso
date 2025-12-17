import React from 'react'
import { useJoinCommunity } from '@/hooks/useCommunities'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'

export default function CommunityCard({ community }: { community: any }) {
  const joinMutation = useJoinCommunity()
  const { user } = useAuth()
  const [, setLocation] = useLocation()
  const [isJoining, setIsJoining] = React.useState(false)

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return alert('Please sign in to join communities')
    if (isJoining) return
    setIsJoining(true)
    try {
      const res = await joinMutation.mutateAsync({ communityId: community.id })
      // Redirect to community page
      setLocation(`/communities/${community.id}`)
    } catch (err) {
      console.error('Join error', err)
      // join mutation already toasts; show fallback
      alert(err instanceof Error ? err.message : 'Failed to join community')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold">{community.name}</h4>
          <span className="text-xs px-2 py-0.5 bg-muted rounded">{community.visibility || 'public'}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{community.description || 'No description'}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{community.members_count ? `${community.members_count} members` : ''}</div>
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 disabled:opacity-60 text-sm"
        >
          {isJoining ? 'Joining...' : 'Join'}
        </button>
      </div>
    </div>
  )
}
