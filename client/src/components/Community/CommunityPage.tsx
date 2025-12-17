import React, { useState, useEffect } from 'react'
import { useRoute } from 'wouter'
import { useChannelsForCommunity, useChannelMessages, useCreateChannel, useCommunities } from '@/hooks/useCommunities'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import CommunityChannel from './CommunityChannel'

export default function CommunityPage() {
  const [, params] = useRoute('/communities/:id')
  const id = params?.id
  const { data: communityData } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${id}`)
      if (!res.ok) throw new Error('Failed to fetch community')
      return res.json()
    },
    enabled: !!id,
  })
  const { data: channels = [] } = useChannelsForCommunity(id)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const { user } = useAuth()
  const createChannelMutation = useCreateChannel(id)

  useEffect(() => {
    if (channels.length && !selectedChannel) setSelectedChannel(channels[0].id)
  }, [channels, selectedChannel])

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !id) return
    try {
      await createChannelMutation.mutateAsync({
        name: newChannelName.trim(),
        type: 'text',
        isPrivate: false,
      })
      setNewChannelName('')
      setShowCreateChannel(false)
    } catch (err) {
      console.error('Failed to create channel:', err)
    }
  }

  return (
    <div className="p-4 flex gap-4 h-full">
      <div className="w-80 border-r pr-4 flex flex-col">
        <h2 className="text-xl font-bold">{communityData?.name || 'Community'}</h2>
        <p className="text-muted-foreground text-sm">{communityData?.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Channels</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowCreateChannel(!showCreateChannel)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {showCreateChannel && (
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChannel()
                if (e.key === 'Escape') setShowCreateChannel(false)
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateChannel}>
              Create
            </Button>
          </div>
        )}
        
        <div className="mt-2 flex flex-col gap-1 flex-1 overflow-auto">
          {channels.map((ch: any) => (
            <button
              key={ch.id}
              className={`text-left p-2 rounded text-sm transition ${
                selectedChannel === ch.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedChannel(ch.id)}
            >
              #{ch.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <CommunityChannel communityId={id as string} channelId={selectedChannel} userId={user?.id} />
        ) : (
          <div className="p-6 text-muted-foreground text-center">
            {channels.length === 0 ? 'Create a channel to get started' : 'No channel selected'}
          </div>
        )}
      </div>
    </div>
  )
}
