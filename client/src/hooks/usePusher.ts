import { useEffect, useRef } from 'react'
import PusherClient from 'pusher-js'

const pusherInstance = new PusherClient('b899008fb2257ea055b9', {
  cluster: 'eu',
})

export function usePusher(conversationId: string | null, onNewMessage: (message: any) => void) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!conversationId) {
      if (channelRef.current) {
        pusherInstance.unsubscribe(`conversation-${conversationId}`)
        channelRef.current = null
      }
      return
    }

    const channel = pusherInstance.subscribe(`conversation-${conversationId}`)
    channelRef.current = channel

    channel.bind('new-message', (data: any) => {
      onNewMessage(data.message)
    })

    return () => {
      pusherInstance.unsubscribe(`conversation-${conversationId}`)
      channelRef.current = null
    }
  }, [conversationId, onNewMessage])

  return pusherInstance
}
