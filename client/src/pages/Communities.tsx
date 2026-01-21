import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'wouter'
import { useCommunities, useChannelsForCommunity, useChannelMessages, useSendChannelMessage, useCommunityMembers } from '@/hooks/useCommunities'
import { useAuth } from '@/contexts/AuthContext'
import CreateCommunityDialog from '@/components/CreateCommunityDialog'
import DiscoverCommunities from '@/components/Community/DiscoverCommunities'
import { Users, Calendar, Plus, Settings, Hash, Volume2, User, Send } from 'lucide-react'

interface Community {
  id: string
  name: string
  description: string
  visibility: string
  created_at: string
}

interface Channel {
  id: string
  name: string
  type: 'text' | 'voice'
}

export default function Communities() {
  const { user } = useAuth()
  const { data: communities = [], isLoading, error } = useCommunities()
  const [showDiscover, setShowDiscover] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const { data: channels = [] } = useChannelsForCommunity(selectedCommunity?.id)
  const { data: messages = [] } = useChannelMessages(selectedChannel?.id)
  const { data: members = [] } = useCommunityMembers(selectedCommunity?.id)
  const sendMessageMutation = useSendChannelMessage()

  const errorMessage = error ? (typeof error === 'string' ? error : error.message || JSON.stringify(error)) : ''

  const handleSendMessage = () => {
    if (!selectedChannel || !user || !messageInput.trim()) return
    sendMessageMutation.mutate({
      channelId: selectedChannel.id,
      senderId: user.id,
      content: messageInput.trim()
    })
    setMessageInput('')
  }

  return (
    <div className='h-screen flex bg-[#020617] text-white'>
      {/* Sidebar 1: Server Rail */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className='w-16 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 space-y-2'
      >
        {communities.map((community: Community) => (
          <motion.div
            key={community.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
              selectedCommunity?.id === community.id
                ? 'bg-primary/20 shadow-lg shadow-primary/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setSelectedCommunity(community)}
            title={community.name}
          >
            <span className='text-lg font-bold'>{community.name.slice(0, 1).toUpperCase()}</span>
          </motion.div>
        ))}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer'
          onClick={() => setShowDiscover(true)}
        >
          <Plus className='w-6 h-6' />
        </motion.div>
      </motion.div>

      {/* Sidebar 2: Channel List */}
      <AnimatePresence>
        {selectedCommunity && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className='w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col'
          >
            {/* Community Header */}
            <div className='p-4 border-b border-white/10'>
              <div className='flex items-center justify-between'>
                <h2 className='font-bold text-lg'>{selectedCommunity.name}</h2>
                <Settings className='w-5 h-5 cursor-pointer hover:text-primary' />
              </div>
              <p className='text-sm text-gray-400 mt-1'>{selectedCommunity.description}</p>
            </div>

            {/* Channels */}
            <div className='flex-1 p-2'>
              <div className='mb-4'>
                <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>Text Channels</h3>
                {channels.filter((c: Channel) => c.type === 'text').map((channel: Channel) => (
                  <motion.div
                    key={channel.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    className={`flex items-center p-2 rounded cursor-pointer mb-1 ${
                      selectedChannel?.id === channel.id ? 'bg-primary/20' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Hash className='w-4 h-4 mr-2 text-gray-400' />
                    <span className='text-sm'>{channel.name}</span>
                  </motion.div>
                ))}
              </div>
              <div>
                <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>Voice Channels</h3>
                {channels.filter((c: Channel) => c.type === 'voice').map((channel: Channel) => (
                  <motion.div
                    key={channel.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    className={`flex items-center p-2 rounded cursor-pointer mb-1 ${
                      selectedChannel?.id === channel.id ? 'bg-primary/20' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Volume2 className='w-4 h-4 mr-2 text-gray-400' />
                    <span className='text-sm'>{channel.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* User Profile */}
            <div className='p-2 border-t border-white/10'>
              <div className='flex items-center p-2 bg-white/10 rounded-lg'>
                <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3'>
                  <span className='text-sm font-bold'>U</span>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Username</p>
                  <p className='text-xs text-green-400'>Online</p>
                </div>
                <div className='flex space-x-1'>
                  <div className='w-6 h-6 bg-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500'>
                    <span className='text-xs'>🎤</span>
                  </div>
                  <div className='w-6 h-6 bg-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-gray-500'>
                    <span className='text-xs'>🎧</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {selectedCommunity && selectedChannel ? (
          <div className='flex-1 flex flex-col'>
            <div className='flex-1 p-4 overflow-y-auto'>
              <h1 className='text-2xl font-bold mb-4'>#{selectedChannel.name}</h1>
              <div className='space-y-4'>
                {messages.map((message: any) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white/5 p-3 rounded hover:bg-white/10 transition-colors'
                  >
                    <div className='flex items-center mb-2'>
                      <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3'>
                        <span className='text-sm font-bold'>{message.profiles?.username?.slice(0, 1).toUpperCase() || 'U'}</span>
                      </div>
                      <span className='font-medium'>{message.profiles?.username || 'Unknown'}</span>
                      <span className='text-xs text-gray-400 ml-2'>{new Date(message.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className='text-sm'>{message.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className='p-4 border-t border-white/10'>
              <div className='flex items-center bg-white/5 rounded-lg p-2'>
                <input
                  type='text'
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message #${selectedChannel.name}`}
                  className='flex-1 bg-transparent outline-none text-white placeholder-gray-400'
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className='ml-2 p-2 bg-primary rounded hover:bg-primary/80 disabled:opacity-50'
                >
                  <Send className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-4'>Welcome to {selectedCommunity?.name || 'Communities'}</h2>
              <p className='text-gray-400'>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: Member List */}
      {selectedCommunity && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className='w-64 bg-white/5 backdrop-blur-md border-l border-white/10 p-4'
        >
          <h3 className='text-lg font-bold mb-4'>Members - {members.length}</h3>
          <div className='space-y-2'>
            {members.map((member: any) => (
              <div key={member.id} className='flex items-center p-2 rounded hover:bg-white/10'>
                <div className='relative mr-3'>
                  <div className='w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center'>
                    <User className='w-4 h-4' />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#020617] ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <span className='text-sm'>{member.profiles?.username || 'Unknown'}</span>
                <div className='ml-auto'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showDiscover && <DiscoverCommunities onClose={() => setShowDiscover(false)} />}
    </div>
  )
}
