import AddStoryDialog from '@/components/AddStoryDialog'
import ChatWindow from '@/components/ChatWindow'
import StoryViewer from '@/components/StoryViewer'
import UserAvatar from '@/components/UserAvatar'
import VideoCall from '@/components/agora/VideoCall'
import VoiceCall from '@/components/agora/VoiceCall'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  useConversations,
  useGetOrCreateConversation,
  useMessages,
  useSendMessage,
} from '@/hooks/useMessages'
import { useSearchProfiles } from '@/hooks/useProfiles'
import { useProfile } from '@/hooks/useProfiles'
import { usePusher } from '@/hooks/usePusher'
import { useRTL } from '@/hooks/useRTL'
import { useStories } from '@/hooks/useStories'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Camera,
  Circle,
  Edit,
  MessageCircle,
  MoreVertical,
  Phone,
  Pin,
  Plus,
  Search as SearchIcon,
  Settings,
  Trash2,
  Video,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function Messages() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const { data: conversations } = useConversations()
  const { data: stories = [], isLoading: storiesLoading } = useStories()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localMessages, setLocalMessages] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null)
  const [addStoryOpen, setAddStoryOpen] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isVoiceCalling, setIsVoiceCalling] = useState(false)
  const { data: searchResults = [] } = useSearchProfiles(searchQuery)
  const { toast } = useToast()
  const getOrCreateConversationMutation = useGetOrCreateConversation()
  const { data: messages = [] } = useMessages(selectedConversation)
  const sendMessageMutation = useSendMessage()
  const isRTL = useRTL()

  const handleNewMessage = useCallback((newMessage: any) => {
    setLocalMessages((prev) => {
      if (prev.some((msg) => msg.id === newMessage.id)) {
        return prev
      }
      return [...prev, newMessage]
    })
  }, [])

  usePusher(selectedConversation, handleNewMessage)

  const handleTypingEvent = useCallback((event: any) => {
    if (!event || !event.userId) return
    setTypingUsers((prev) => {
      if (prev.some((u) => u === event.userId)) return prev
      return [...prev, event.userId]
    })
    // remove after 3s
    setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u !== event.userId))
    }, 3000)
  }, [])

  usePusher(selectedConversation, handleTypingEvent, { eventName: 'typing', isConversation: true })

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      }
    }
  }, [conversations, selectedConversation])

  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages)
    }
  }, [messages])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: text,
      })
    } catch (error) {
      logger.error('Error sending message:', error)
    }
  }

  const handleStartConversation = async (userId: string) => {
    try {
      const { conversationId } = await getOrCreateConversationMutation.mutateAsync(userId)
      setSelectedConversation(conversationId)
      setDialogOpen(false)
      setSearchQuery('')
      setShowSidebar(false)
      toast({
        title: 'Conversation started!',
        description: 'You can now chat with this user.',
      })
    } catch (error: any) {
      logger.error('Error starting conversation:', error)
      toast({
        title: 'Cannot start conversation',
        description:
          error?.message || 'Failed to start a conversation with this user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  const handleBackToList = () => {
    setShowSidebar(true)
    setSelectedConversation(null)
  }

  const formattedMessages = localMessages.map((msg: any) => ({
    id: msg.id,
    text: msg.content,
    timestamp: format(new Date(msg.created_at), 'h:mm a'),
    isSent: msg.sender_id === user?.id,
    senderName: msg.sender?.username || 'User',
    isRead: msg.read,
  }))

  const selectedConversationData = conversations?.find(
    (c) => c.conversation_id === selectedConversation
  )

  const startVideoCall = () => setIsCalling(true)
  const endVideoCall = () => setIsCalling(false)

  const startVoiceCall = () => setIsVoiceCalling(true)
  const endVoiceCall = () => setIsVoiceCalling(false)

  if (isCalling && selectedConversation) {
    return <VideoCall channelName={selectedConversation} onEndCall={endVideoCall} />
  }

  if (isVoiceCalling && selectedConversation) {
    return <VoiceCall channelName={selectedConversation} onEndCall={endVoiceCall} />
  }

  return (
    <div className={`h-full flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-background`}>
      <aside
        className={cn(
          'w-full md:w-[340px] lg:w-[360px] md:border-r border-border/40 bg-background flex flex-col',
          'transition-all duration-300',
          showSidebar ? 'flex' : 'hidden md:flex'
        )}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chats</h1>
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted">
                  <Edit className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <NewConversationDialog
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                userId={user?.id}
                onStartConversation={handleStartConversation}
              />
            </Dialog>
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="h-10 pl-10 bg-muted/60 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <div className="px-2 py-3">
          <ScrollArea className="w-full">
            <div className="flex gap-3 px-2">
              <button
                className="flex flex-col items-center gap-1.5 min-w-fit group"
                onClick={() => setAddStoryOpen(true)}
              >
                <div className="relative">
                  <UserAvatar
                    src={profile?.avatar_url}
                    name={profile?.username || user?.email || 'Me'}
                    size="lg"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">Your story</span>
              </button>

              {!storiesLoading &&
                stories.map((story, index) => (
                  <button
                    key={story.id}
                    className="flex flex-col items-center gap-1.5 min-w-fit group"
                    onClick={() => setViewingStoryIndex(index)}
                  >
                    <div className="relative">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500">
                        <Avatar className="h-14 w-14 border-2 border-background">
                          <AvatarImage src={story.profiles.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white text-sm">
                            {story.profiles.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[60px]">
                      {story.profiles.username}
                    </span>
                  </button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>

        <div className="border-t border-border/30" />

        <ScrollArea className="flex-1">
          <div className="py-1">
            {!conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Start a conversation with someone!
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary rounded-full px-6">Start Chat</Button>
                  </DialogTrigger>
                  <NewConversationDialog
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    userId={user?.id}
                    onStartConversation={handleStartConversation}
                  />
                </Dialog>
              </div>
            ) : (
              [...conversations]
                .sort((a, b) => {
                  const dateA = a.last_message?.created_at
                    ? new Date(a.last_message.created_at).getTime()
                    : 0
                  const dateB = b.last_message?.created_at
                    ? new Date(b.last_message.created_at).getTime()
                    : 0
                  return dateB - dateA
                })
                .map((conv: any) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleSelectConversation(conv.conversation_id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                      selectedConversation === conv.conversation_id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={conv.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white text-lg">
                          {conv.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{conv.username || 'Unknown'}</p>
                        {conv.last_message && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {format(new Date(conv.last_message.created_at), 'h:mm a')}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))
            )}
          </div>
        </ScrollArea>
      </aside>

      <main
        className={cn(
          'flex-1 flex flex-col bg-background min-w-0',
          !showSidebar ? 'flex' : 'hidden md:flex'
        )}
      >
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-background">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full flex-shrink-0 md:hidden"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversationData?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white">
                    {selectedConversationData?.username?.slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {selectedConversationData?.username || 'Chat'}
                </p>
                <p className="text-xs text-green-500">Active now</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full"
                  onClick={startVoiceCall}
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full"
                  onClick={startVideoCall}
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm border-border/50 bg-card/95 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Chat Settings
                      </DialogTitle>
                      <DialogDescription>Manage conversation settings</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <VolumeX className="h-5 w-5" />
                        Mute Notifications
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <Pin className="h-5 w-5" />
                        Pin Conversation
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete Conversation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                chatName={selectedConversationData?.username || 'Chat'}
                isOnline={true}
                messages={formattedMessages}
                onSendMessage={handleSendMessage}
                conversationId={selectedConversation}
                typingUsers={typingUsers}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4 p-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Your Messages</h3>
                <p className="text-muted-foreground text-sm">Send private messages to a friend</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary rounded-full px-8">Send Message</Button>
                </DialogTrigger>
                <NewConversationDialog
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  userId={user?.id}
                  onStartConversation={handleStartConversation}
                />
              </Dialog>
            </div>
          </div>
        )}
      </main>

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
        />
      )}

      <AddStoryDialog open={addStoryOpen} onOpenChange={setAddStoryOpen} />
    </div>
  )
}

function NewConversationDialog({
  searchQuery,
  setSearchQuery,
  searchResults,
  userId,
  onStartConversation,
}: {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: any[]
  userId?: string
  onStartConversation: (userId: string) => void
}) {
  return (
    <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle>New Message</DialogTitle>
        <DialogDescription>Search for someone to message</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-border/50 focus:border-primary rounded-full"
          />
        </div>

        <ScrollArea className="max-h-[300px]">
          <div className="space-y-1">
            {searchResults.length > 0 ? (
              searchResults
                .filter((profile) => profile.id !== userId)
                .map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => onStartConversation(profile.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white">
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{profile.username}</p>
                      {profile.full_name && (
                        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                      )}
                    </div>
                  </button>
                ))
            ) : searchQuery ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">Start typing to search</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </DialogContent>
  )
}
