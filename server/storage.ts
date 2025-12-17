import { type User, type InsertUser, type Message, type Community, type CommunityMember, type Channel, type ChannelMessage, type MessageReaction, type LiveSession } from "@shared/schema";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { encrypt, decrypt, isEncrypted } from "./lib/encryption";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>;
  getOrCreateConversation(userId1: string, userId2: string): Promise<string>;
  // Communities and channels
  createCommunity(ownerId: string, name: string, description?: string, visibility?: string): Promise<Community>;
  getCommunity(id: string): Promise<Community | undefined>;
  listCommunitiesForUser(userId: string): Promise<Community[]>;
  joinCommunity(communityId: string, userId: string, role?: string): Promise<CommunityMember>;
  createChannel(communityId: string, name: string, type?: string, isPrivate?: boolean): Promise<Channel>;
  getChannelsForCommunity(communityId: string): Promise<Channel[]>;
  sendChannelMessage(channelId: string, senderId: string, content: string): Promise<ChannelMessage>;
  getChannelMessages(channelId: string): Promise<ChannelMessage[]>;
  // Message reactions and status
  setMessageRead(messageId: string): Promise<void>;
  toggleMessageReaction(messageId: string, userId: string, reaction: string, isChannelMessage?: boolean): Promise<MessageReaction | null>;
  createLiveSession(channelId: string, hostId: string, title?: string): Promise<LiveSession>;
  endLiveSession(sessionId: string): Promise<void>;
  // Search
  searchPublicCommunities(q?: string, page?: number, pageSize?: number): Promise<Community[]>;
}

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('Supabase client initialized successfully');
} else {
  console.warn('Supabase environment variables not configured. Some features may be limited.');
}

export class SupabaseStorage implements IStorage {
  private checkSupabase(): SupabaseClient {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
    }
    return supabase;
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return undefined;
      }

      return data as User;
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching user by username:', error);
        return undefined;
      }

      return data as User;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('users')
        .insert([insertUser])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      return data as User;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      const messages = (data as Message[]).map(msg => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content
      }));

      return messages;
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    try {
      const client = this.checkSupabase();
      const encryptedContent = encrypt(content);
      
      const { data, error } = await client
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          content: encryptedContent,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return {
        ...data,
        content: content
      } as Message;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    try {
      const client = this.checkSupabase();
      
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await client
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (checkError) throw checkError;

      // Check if any of these conversations include userId2
      for (const { conversation_id } of existingConversation || []) {
        const { data: otherParticipant } = await client
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conversation_id)
          .eq('user_id', userId2);

        if (otherParticipant && otherParticipant.length > 0) {
          return conversation_id;
        }
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await client
        .from('conversations')
        .insert([{}])
        .select()
        .single();

      if (createError) throw createError;

      // Add participants
      await client
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: userId1 },
          { conversation_id: newConversation.id, user_id: userId2 },
        ]);

      return newConversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  }

  // Communities and channels
  async createCommunity(ownerId: string, name: string, description = '', visibility = 'public'): Promise<Community> {
    try {
      const client = this.checkSupabase();
      // Ensure unique community name (case-insensitive)
      const { data: existing } = await client
        .from('communities')
        .select('*')
        .ilike('name', name)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error('Community name already exists')
      }

      const { data, error } = await client
        .from('communities')
        .insert([{ owner_id: ownerId, name, description, visibility }])
        .select()
        .single();

      if (error) throw error;
      // Add owner as first member with role 'owner'
      try {
        await client.from('community_members').insert([{ community_id: data.id, user_id: ownerId, role: 'owner' }])
      } catch (e) {
        console.warn('Failed to insert owner as community member:', e)
      }

      return data as Community;
    } catch (error) {
      console.error('Error in createCommunity:', error);
      throw error;
    }
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching community:', error);
        return undefined;
      }
      return data as Community;
    } catch (error) {
      console.error('Error in getCommunity:', error);
      return undefined;
    }
  }

  async listCommunitiesForUser(userId: string): Promise<Community[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('community_members')
        .select('communities(*)')
        .eq('user_id', userId);
      if (error) {
        console.error('Error listing communities for user:', error);
        return [];
      }
      return (data || []).map((r: any) => r.communities) as Community[];
    } catch (error) {
      console.error('Error in listCommunitiesForUser:', error);
      return [];
    }
  }

  async joinCommunity(communityId: string, userId: string, role = 'member'): Promise<CommunityMember> {
    try {
      const client = this.checkSupabase();
      // Prevent duplicate joins
      const { data: existing, error: selectError } = await client
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .limit(1);

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        return existing[0] as CommunityMember;
      }

      const { data, error } = await client
        .from('community_members')
        .insert([{ community_id: communityId, user_id: userId, role }])
        .select()
        .single();
      if (error) throw error;
      return data as CommunityMember;
    } catch (error) {
      console.error('Error in joinCommunity:', error);
      throw error;
    }
  }

  async searchPublicCommunities(q = '', page = 1, pageSize = 20): Promise<Community[]> {
    try {
      const client = this.checkSupabase();
      const offset = (page - 1) * pageSize;

      let query = client.from('communities').select('*').eq('visibility', 'public').order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

      if (q && q.trim().length > 0) {
        const term = `%${q.trim()}%`;
        query = client.from('communities').select('*').eq('visibility', 'public').or(`name.ilike.${term},description.ilike.${term}`).order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Community[];
    } catch (error) {
      console.error('Error in searchPublicCommunities:', error);
      return [];
    }
  }

  async createChannel(communityId: string, name: string, type = 'text', isPrivate = false): Promise<Channel> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channels')
        .insert([{ community_id: communityId, name, type, is_private: isPrivate }])
        .select()
        .single();
      if (error) throw error;
      return data as Channel;
    } catch (error) {
      console.error('Error in createChannel:', error);
      throw error;
    }
  }

  async getChannelsForCommunity(communityId: string): Promise<Channel[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channels')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching channels:', error);
        return [];
      }
      return data as Channel[];
    } catch (error) {
      console.error('Error in getChannelsForCommunity:', error);
      return [];
    }
  }

  async sendChannelMessage(channelId: string, senderId: string, content: string): Promise<ChannelMessage> {
    try {
      const client = this.checkSupabase();
      const encryptedContent = encrypt(content);
      const { data, error } = await client
        .from('channel_messages')
        .insert([{ channel_id: channelId, sender_id: senderId, content: encryptedContent }])
        .select()
        .single();
      if (error) throw error;
      return { ...data, content } as ChannelMessage;
    } catch (error) {
      console.error('Error in sendChannelMessage:', error);
      throw error;
    }
  }

  async getChannelMessages(channelId: string): Promise<ChannelMessage[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channel_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching channel messages:', error);
        return [];
      }
      const messages = (data as ChannelMessage[]).map(msg => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content
      }));
      return messages;
    } catch (error) {
      console.error('Error in getChannelMessages:', error);
      return [];
    }
  }

  async setMessageRead(messageId: string): Promise<void> {
    try {
      const client = this.checkSupabase();
      const { error } = await client
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
      if (error) throw error;
    } catch (error) {
      console.error('Error in setMessageRead:', error);
      throw error;
    }
  }

  async toggleMessageReaction(messageId: string, userId: string, reaction: string, isChannelMessage = false): Promise<MessageReaction | null> {
    try {
      const client = this.checkSupabase();
      // Check existing - support both message types
      const query = client
        .from('message_reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('reaction', reaction);
      
      if (isChannelMessage) {
        query.eq('channel_message_id', messageId);
      } else {
        query.eq('message_id', messageId);
      }
      
      const { data: existing, error: selectError } = await query;

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        // Remove
        const { error: delError } = await client
          .from('message_reactions')
          .delete()
          .eq('id', existing[0].id)
        if (delError) throw delError;
        return null;
      }

      // Insert - support both message types
      const reactionData: any = {
        user_id: userId,
        reaction
      };
      if (isChannelMessage) {
        reactionData.channel_message_id = messageId;
      } else {
        reactionData.message_id = messageId;
      }
      
      const { data, error } = await client
        .from('message_reactions')
        .insert([reactionData])
        .select()
        .single();
      if (error) throw error;
      return data as MessageReaction;
    } catch (error) {
      console.error('Error in toggleMessageReaction:', error);
      throw error;
    }
  }

  async createLiveSession(channelId: string, hostId: string, title = ''): Promise<LiveSession> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('live_sessions')
        .insert([{ channel_id: channelId, host_id: hostId, title, is_live: true }])
        .select()
        .single();
      if (error) throw error;
      return data as LiveSession;
    } catch (error) {
      console.error('Error in createLiveSession:', error);
      throw error;
    }
  }

  async endLiveSession(sessionId: string): Promise<void> {
    try {
      const client = this.checkSupabase();
      const { error } = await client
        .from('live_sessions')
        .update({ is_live: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (error) throw error;
    } catch (error) {
      console.error('Error in endLiveSession:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();



// Buzly Web App
// Owner: YA SO
// Date: 11-12-2025
