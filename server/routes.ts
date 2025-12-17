import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";

// Store active WebSocket connections for real-time updates
const wsClients = new Set<any>();

// Helper function to broadcast messages to all connected clients
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wsClients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Messaging routes
  
  // Get messages for a conversation
  app.get('/api/messages/:conversationId', async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send a message
  app.post('/api/messages', async (req, res) => {
    try {
      const { conversationId, senderId, content } = req.body;

      if (!conversationId || !senderId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const message = await storage.sendMessage(conversationId, senderId, content);
      
      // Broadcast to WebSocket clients
      broadcastUpdate('message', {
        conversationId,
        message,
      });

      // Broadcast to Pusher
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `conversation-${conversationId}`;
        await pusherModule.pusher.trigger(channel, 'new-message', { message });
        console.log(`[Pusher] Message broadcast to channel: ${channel}`);
      } catch (err) {
        console.error('[Pusher] Error broadcasting message:', err instanceof Error ? err.message : err);
      }

      res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get or create conversation
  app.post('/api/conversations', async (req, res) => {
    try {
      const { userId1, userId2 } = req.body;

      if (!userId1 || !userId2) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (userId1 === userId2) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
      }

      const conversationId = await storage.getOrCreateConversation(userId1, userId2);
      res.json({ conversationId });
    } catch (error: any) {
      console.error('Error creating/getting conversation:', error);
      res.status(500).json({ 
        error: error?.message || 'Failed to create conversation',
        details: error?.toString()
      });
    }
  });

  // Get user by username
  app.get('/api/users/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Recommendations
  app.get('/api/recommendations/:userId', async (req, res) => {
    try {
      const { recommendationEngine } = await import('./lib/recommendations');
      const recommendations = await recommendationEngine.getRecommendedPosts(req.params.userId, 20);
      res.json({ recommendations });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // Communities
  app.post('/api/communities', async (req, res) => {
    try {
      const { ownerId, name, description, visibility } = req.body;
      if (!ownerId || !name) return res.status(400).json({ error: 'Missing required fields' });
      const community = await storage.createCommunity(ownerId, name, description, visibility);
      res.json(community);
    } catch (error) {
      console.error('Error creating community:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  });

  // Search / discover public communities
  app.get('/api/communities', async (req, res) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const page = req.query.page ? parseInt(String(req.query.page), 10) || 1 : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) || 20 : 20;
      const communities = await storage.searchPublicCommunities(q, page, limit);
      res.json({ communities, page, limit });
    } catch (error) {
      console.error('Error searching communities:', error);
      res.status(500).json({ error: 'Failed to search communities' });
    }
  });

  app.get('/api/communities/:id', async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) return res.status(404).json({ error: 'Community not found' });
      res.json(community);
    } catch (error) {
      console.error('Error fetching community:', error);
      res.status(500).json({ error: 'Failed to fetch community' });
    }
  });

  app.get('/api/users/:userId/communities', async (req, res) => {
    try {
      const communities = await storage.listCommunitiesForUser(req.params.userId);
      res.json(communities);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      res.status(500).json({ error: 'Failed to fetch communities' });
    }
  });

  app.post('/api/communities/:id/join', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      const member = await storage.joinCommunity(req.params.id, userId);
      res.json(member);
    } catch (error) {
      console.error('Error joining community:', error);
      res.status(500).json({ error: 'Failed to join community' });
    }
  });

  // Channels
  app.post('/api/communities/:id/channels', async (req, res) => {
    try {
      const { name, type, isPrivate } = req.body;
      if (!name) return res.status(400).json({ error: 'Missing channel name' });
      const channel = await storage.createChannel(req.params.id, name, type, isPrivate);
      res.json(channel);
    } catch (error) {
      console.error('Error creating channel:', error);
      res.status(500).json({ error: 'Failed to create channel' });
    }
  });

  app.get('/api/communities/:id/channels', async (req, res) => {
    try {
      const channels = await storage.getChannelsForCommunity(req.params.id);
      res.json(channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  });

  app.get('/api/channel/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getChannelMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      res.status(500).json({ error: 'Failed to fetch channel messages' });
    }
  });

  app.post('/api/channel/messages', async (req, res) => {
    try {
      const { channelId, senderId, content } = req.body;
      if (!channelId || !senderId || !content) return res.status(400).json({ error: 'Missing required fields' });
      const message = await storage.sendChannelMessage(channelId, senderId, content);

      // Broadcast to WebSocket clients
      broadcastUpdate('channel-message', { channelId, message });

      // Broadcast to Pusher
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `community-${message.channel_id}-channel-${channelId}`;
        await pusherModule.pusher.trigger(channel, 'new-channel-message', { message });
        console.log(`[Pusher] Channel message broadcast to channel: ${channel}`);
      } catch (err) {
        console.error('[Pusher] Error broadcasting channel message:', err instanceof Error ? err.message : err);
      }

      res.json(message);
    } catch (error) {
      console.error('Error sending channel message:', error);
      res.status(500).json({ error: 'Failed to send channel message' });
    }
  });

  // Start a live session for a channel
  app.post('/api/communities/:communityId/channels/:channelId/live', async (req, res) => {
    try {
      const { hostId, title } = req.body;
      if (!hostId) return res.status(400).json({ error: 'Missing hostId' });
      const session = await storage.createLiveSession(req.params.channelId, hostId, title);
      // Broadcast to channel
      broadcastUpdate('live-start', { channelId: req.params.channelId, session });
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `community-${req.params.communityId}-channel-${req.params.channelId}`;
        await pusherModule.pusher.trigger(channel, 'live-start', { session });
      } catch (err) {
        console.error('[Pusher] Error broadcasting live start:', err instanceof Error ? err.message : err);
      }
      res.json(session);
    } catch (error) {
      console.error('Error starting live session:', error);
      res.status(500).json({ error: 'Failed to start live session' });
    }
  });

  // End live session
  app.post('/api/live/:sessionId/end', async (req, res) => {
    try {
      await storage.endLiveSession(req.params.sessionId);
      broadcastUpdate('live-end', { sessionId: req.params.sessionId });
      res.json({ ok: true });
    } catch (error) {
      console.error('Error ending live session:', error);
      res.status(500).json({ error: 'Failed to end live session' });
    }
  });

  // Mark message as read
  app.post('/api/messages/:id/read', async (req, res) => {
    try {
      await storage.setMessageRead(req.params.id)
      // Broadcast read event
      broadcastUpdate('message-read', { messageId: req.params.id })
      res.json({ ok: true })
    } catch (error) {
      console.error('Error marking message read:', error);
      res.status(500).json({ error: 'Failed to mark message read' })
    }
  })

  // Typing indicator
  app.post('/api/conversations/:id/typing', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });
      broadcastUpdate('typing', { conversationId: req.params.id, userId });
      // Trigger Pusher as well
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `conversation-${req.params.id}`;
        await pusherModule.pusher.trigger(channel, 'typing', { userId });
      } catch (err) {
        console.error('[Pusher] Error broadcasting typing:', err instanceof Error ? err.message : err);
      }
      res.json({ ok: true })
    } catch (error) {
      console.error('Error sending typing:', error);
      res.status(500).json({ error: 'Failed to send typing' })
    }
  })

  // Reactions
  app.post('/api/messages/:id/react', async (req, res) => {
    try {
      const { userId, reaction } = req.body;
      if (!userId || !reaction) return res.status(400).json({ error: 'Missing fields' });
      const result = await storage.toggleMessageReaction(req.params.id, userId, reaction);
      broadcastUpdate('message-reaction', { messageId: req.params.id, userId, reaction, action: result ? 'added' : 'removed' })
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `conversation-${req.params.id}`;
        await pusherModule.pusher.trigger(channel, 'message-reaction', { messageId: req.params.id, userId, reaction, action: result ? 'added' : 'removed' });
      } catch (err) {
        console.error('[Pusher] Error broadcasting message reaction:', err instanceof Error ? err.message : err);
      }
      res.json({ ok: true, reaction: result });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  })

  // Channel message reactions
  app.post('/api/channel/messages/:id/react', async (req, res) => {
    try {
      const { userId, reaction, channelId, communityId } = req.body;
      if (!userId || !reaction) return res.status(400).json({ error: 'Missing fields' });
      const result = await storage.toggleMessageReaction(req.params.id, userId, reaction, true); // isChannelMessage = true
      broadcastUpdate('channel-message-reaction', { messageId: req.params.id, userId, reaction, action: result ? 'added' : 'removed' });
      try {
        const pusherModule = await import('./pusher.ts');
        const channel = `community-${communityId}-channel-${channelId}`;
        await pusherModule.pusher.trigger(channel, 'message-reaction', { messageId: req.params.id, userId, reaction, action: result ? 'added' : 'removed' });
      } catch (err) {
        console.error('[Pusher] Error broadcasting channel message reaction:', err instanceof Error ? err.message : err);
      }
      res.json({ ok: true, reaction: result });
    } catch (error) {
      console.error('Error toggling channel message reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  })

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  // Use noServer: true to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    // Handle WebSocket upgrades for paths starting with /api/realtime
    if (request.url?.startsWith('/api/realtime')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    wsClients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to real-time server' }));
  });

  return httpServer;
}
