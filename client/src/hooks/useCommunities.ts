import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from './use-toast'
import { logger } from '@/lib/logger'

export function useCommunities() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['communities', user?.id],
    queryFn: async () => {
      try {
        if (!user) {
          // If no user, show public communities for discovery
          const res = await fetch('/api/communities')
          if (!res.ok) throw new Error('Failed to fetch communities')
          const body = await res.json()
          return body.communities || []
        }

        // Fetch communities the user is a member of
        const res = await fetch(`/api/users/${user.id}/communities`)
        if (!res.ok) throw new Error('Failed to fetch user communities')
        return res.json()
      } catch (error: any) {
        console.error('Error in useCommunities:', error)
        throw new Error(error?.message || 'Failed to fetch communities')
      }
    },
    refetchInterval: 5000,
    staleTime: 0,
    retry: 2,
  })
}

export function useDiscoverCommunities(q = '', page = 1, limit = 20) {
  return useQuery({
    queryKey: ['discover-communities', q, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetch(`/api/communities?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch discover communities')
      const body = await res.json()
      return body.communities || []
    },
    enabled: true,
  })
}

export function useCreateCommunity() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ name, description, visibility }: { name: string; description?: string; visibility?: string }) => {
      if (!user) throw new Error('Must be logged in to create a community')
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user.id, name, description, visibility }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create community')
      }
      return res.json()
    },
    onSuccess: (data) => {
      // Invalidate all community-related queries
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      
      // Also refetch immediately to show new community
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['communities'] })
      }, 100)
      
      toast({ 
        title: 'Community created!', 
        description: `"${data.name}" was created successfully.` 
      })
    },
    onError: (error: any) => {
      console.error('Create community error:', error)
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create community', 
        variant: 'destructive' 
      })
    }
  })
}

export function useJoinCommunity() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('Must be logged in to join communities')
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error('Failed to join community')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast({ title: 'Joined community', description: 'You joined the community.' })
    },
  })
}

export function useChannelsForCommunity(communityId?: string) {
  return useQuery({
    queryKey: ['channels', communityId],
    queryFn: async () => {
      if (!communityId) return []
      const res = await fetch(`/api/communities/${communityId}/channels`)
      if (!res.ok) throw new Error('Failed to fetch channels')
      return res.json()
    },
    enabled: !!communityId,
  })
}

export function useCreateChannel(communityId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({ name, type, isPrivate }: { name: string; type?: string; isPrivate?: boolean }) => {
      if (!communityId) throw new Error('Missing community id')
      const res = await fetch(`/api/communities/${communityId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, isPrivate }),
      })
      if (!res.ok) throw new Error('Failed to create channel')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', communityId] })
      toast({ title: 'Channel created', description: 'Channel created successfully.' })
    },
  })
}

export function useChannelMessages(channelId?: string) {
  return useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      if (!channelId) return []
      const res = await fetch(`/api/channel/${channelId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch channel messages')
      return res.json()
    },
    enabled: !!channelId,
    refetchInterval: 5000,
  })
}

export function useSendChannelMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ channelId, senderId, content }: { channelId: string; senderId: string; content: string }) => {
      const res = await fetch('/api/channel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, senderId, content }),
      })
      if (!res.ok) throw new Error('Failed to send channel message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages'] })
    }
  })
}

export default useCommunities
