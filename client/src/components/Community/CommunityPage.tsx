import { useChannelsForCommunity } from '@/hooks/useCommunities'
import React, { useState, useEffect } from 'react'
import { useRoute } from 'wouter'
import ChannelList from './ChannelList'
import ChatArea from './ChatArea'

// Placeholder for the member list component (to be built later)
const MemberList = () => {
  return (
    <div className="w-60 bg-[#24272B] p-2">
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-2 mb-2">
        Members - 0
      </h2>
    </div>
  )
}

/**
 * CommunityPage - The main container for the community experience.
 * Now includes a "DEV" badge when in development mode, inspired by your prompt!
 */
export default function CommunityPage() {
  const [, params] = useRoute('/communities/:id')
  const communityId = params?.id
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const { data: channels = [] } = useChannelsForCommunity(communityId)

  // Vite exposes the development status via import.meta.env.DEV
  const isDevMode = import.meta.env.DEV

  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannel])

  if (!communityId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#313439] text-white">
        Community not found.
      </div>
    )
  }

  const selectedChannelObject = channels.find((c: any) => c.id === selectedChannel)

  return (
    <div className="relative flex h-screen w-full bg-[#313439]">
      {/* DEV mode badge, as requested! */}
      {isDevMode && (
        <span className="absolute top-3 right-[15.5rem] z-10 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
          DEV
        </span>
      )}

      <ChannelList
        communityId={communityId}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />
      <ChatArea channelId={selectedChannel} channelName={selectedChannelObject?.name} />
      <MemberList />
    </div>
  )
}
