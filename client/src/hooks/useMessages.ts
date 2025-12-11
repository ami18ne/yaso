import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from './use-toast'
import { logger } from '@/lib/logger'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: {
    user_id: string
    profiles: {
      username: string
      full_name: string | null
      avatar_url: string | null
    }
  }[]
  last_message?: Message
}

export function useConversations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) throw new Error('Must be logged in')

      try {
        logger.info('Fetching conversations for user:', user.id)

        // Get all conversation participants for the current user
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .eq('user_id', user.id)

        if (participantError) {
          logger.error('Error fetching participant data:', participantError)
          throw participantError
        }
        
        logger.info('Found participant data:', participantData?.length || 0, 'conversations')

        if (!participantData || participantData.length === 0) {
          logger.info('No conversations found for this user')
          return []
        }

        // For each conversation, get the other participant's info
        const enrichedConversations = await Promise.all(
          participantData.map(async (participant: any) => {
            try {
              logger.info('Processing conversation:', participant.conversation_id)

              // Get last message
              const { data: messages, error: messagesError } = await supabase
                .from('messages')
                .select('id, content, created_at')
                .eq('conversation_id', participant.conversation_id)
                .order('created_at', { ascending: false })
                .limit(1)

              if (messagesError) {
                logger.error('Error fetching messages for conversation:', participant.conversation_id, messagesError)
              }

              // Get other participant's user_id
              const { data: otherParticipants, error: participantsError } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', participant.conversation_id)
                .neq('user_id', user.id)

              if (participantsError) {
                logger.error('Error fetching other participants:', participantsError)
              }

              const otherUserId = otherParticipants?.[0]?.user_id

              if (!otherUserId) {
                logger.warn('No other participant found for conversation', participant.conversation_id)
                return null
              }

              logger.info('Fetching profile for user:', otherUserId)

              // Get the other user's profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', otherUserId)
                .maybeSingle()  // Changed from single() to maybeSingle() to handle not found gracefully

              if (profileError) {
                logger.error('Error fetching profile for user', otherUserId, ':', profileError)
                return null
              }

              if (!profile) {
                logger.warn('No profile found for user:', otherUserId)
                return null
              }

              const lastMessage = messages?.[0]

              logger.info('Successfully enriched conversation:', participant.conversation_id, 'with user:', profile.username)

              return {
                conversation_id: participant.conversation_id,
                username: profile?.username || 'Unknown User',
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url,
                user_id: profile?.id,
                last_message: lastMessage,
              }
            } catch (conversationError) {
              logger.error('Error processing conversation:', conversationError, participant.conversation_id)
              return null
            }
          })
        )

        // Filter out any null entries (failed conversation enrichments)
        const validConversations = enrichedConversations.filter((conv) => conv !== null)
        logger.info('Successfully enriched', validConversations.length, 'out of', enrichedConversations.length, 'conversations')
        
        return validConversations
      } catch (error) {
        logger.error('Error fetching conversations:', error)
        return []
      }
    },
    enabled: !!user,
    staleTime: 10000,
    refetchInterval: 30000,
  })
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []

      try {
        const response = await fetch(`/api/messages/${conversationId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        return await response.json()
      } catch (error) {
        logger.error('Error fetching messages:', error)
        return []
      }
    },
    enabled: !!conversationId,
    refetchInterval: 3000,
  })
}

export function useSendMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      try {
        if (!user) throw new Error('Must be logged in to send messages')

        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            senderId: user.id,
            content,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        return await response.json()
      } catch (error) {
        logger.error('Error in useSendMessage:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while sending the message')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useGetOrCreateConversation() {
  const { user } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (userId2: string) => {
      if (!user) throw new Error('Must be logged in')

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: user.id,
          userId2,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      return await response.json()
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating conversation',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
