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
