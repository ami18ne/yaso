import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from './logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient: SupabaseClient | null = null;
let isConfigured = false;

function initializeSupabase(): SupabaseClient | null {
  const missingVars: string[] = []

  if (!supabaseUrl || supabaseUrl.trim() === '') {
    missingVars.push('VITE_SUPABASE_URL')
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    missingVars.push('VITE_SUPABASE_ANON_KEY')
  }

  if (missingVars.length > 0) {
    logger.warn(
      `Missing Supabase environment variables: ${missingVars.join(', ')}. ` +
      'Please add them to enable full functionality.'
    )
    return null
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    logger.error('VITE_SUPABASE_URL must be a valid URL starting with http:// or https://')
    return null
  }

  isConfigured = true
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

supabaseClient = initializeSupabase()

export const supabase = supabaseClient!

export function isSupabaseConfigured(): boolean {
  return isConfigured && supabaseClient !== null
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseClient) {
    return false
  }
  
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      logger.error('Supabase connection check failed:', error)
      return false
    }
    return true
  } catch (error) {
    logger.error('Supabase connection check failed:', error)
    return false
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
  }
}
