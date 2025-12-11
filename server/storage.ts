import { type User, type InsertUser, type Message } from "@shared/schema";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { encrypt, decrypt, isEncrypted } from "./lib/encryption";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>;
  getOrCreateConversation(userId1: string, userId2: string): Promise<string>;
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
}

export const storage = new SupabaseStorage();



// Buzly Web App
// Owner: YA SO
// Date: 11-12-2025
