import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from './use-toast'
import { logger } from '@/lib/logger'

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  is_liked?: boolean
  is_saved?: boolean
}

export function usePosts() {
  const { user } = useAuth()
  const { toast } = useToast()

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)

        const { data: saves } = await supabase
          .from('saves')
          .select('post_id')
          .eq('user_id', user.id)

        const likedPostIds = new Set(likes?.map(l => l.post_id) || [])
        const savedPostIds = new Set(saves?.map(s => s.post_id) || [])
        
        return posts.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
          is_saved: savedPostIds.has(post.id)
        }))
      }

      return posts
    },
    refetchInterval: 10000,
  })
}

export function useCreatePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ content, image_url }: { content: string; image_url?: string | null }) => {
      try {
        if (!user) throw new Error('Must be logged in to create a post')

        const { data, error } = await supabase
          .from('posts')
          .insert([{ user_id: user.id, content, image_url }])
          .select(`
            *,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .single()

        if (error) throw new Error(`Failed to create post: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useCreatePost:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while creating the post')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating post',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useLikePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      try {
        if (!user) throw new Error('Must be logged in to like posts')

        if (isLiked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)

          if (error) throw new Error(`Failed to unlike post: ${error.message}`)
        } else {
          const { error } = await supabase
            .from('likes')
            .insert([{ post_id: postId, user_id: user.id }])

          if (error) throw new Error(`Failed to like post: ${error.message}`)
        }
      } catch (error) {
        logger.error('Error in useLikePost:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while updating like status')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useSavePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      try {
        if (!user) throw new Error('Must be logged in to save posts')

        if (isSaved) {
          const { error } = await supabase
            .from('saves')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)

          if (error) throw new Error(`Failed to unsave post: ${error.message}`)
        } else {
          const { error } = await supabase
            .from('saves')
            .insert([{ post_id: postId, user_id: user.id }])

          if (error) throw new Error(`Failed to save post: ${error.message}`)
        }
      } catch (error) {
        logger.error('Error in useSavePost:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while updating save status')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useSavedPosts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data: saves, error } = await supabase
        .from('saves')
        .select(`
          post_id,
          posts!inner (
            *,
            profiles:user_id (username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const posts = saves?.map(save => save.posts).flat() || []

      const postIds = posts.map(p => p.id)
      
      if (postIds.length === 0) return []

      const [likesResult, savesResult] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        supabase.from('saves').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      ])

      const likedPostIds = new Set(likesResult.data?.map(l => l.post_id) || [])
      const savedPostIds = new Set(savesResult.data?.map(s => s.post_id) || [])
      
      return posts.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id)
      }))
    },
    enabled: !!user,
  })
}

export function useDeletePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ postId, imageUrl }: { postId: string; imageUrl?: string | null }) => {
      try {
        if (!user) throw new Error('Must be logged in to delete posts')

        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', user.id)

        if (error) throw new Error(`Failed to delete post: ${error.message}`)

        if (imageUrl && imageUrl.includes('supabase')) {
          try {
            const { deleteMedia } = await import('@/lib/storage')
            await deleteMedia(imageUrl)
          } catch (storageError) {
            logger.error('Failed to delete media from storage:', storageError)
          }
        }
      } catch (error) {
        logger.error('Error in useDeletePost:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while deleting the post')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] })
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useUpdatePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ postId, content, image_url }: { postId: string; content?: string; image_url?: string | null }) => {
      try {
        if (!user) throw new Error('Must be logged in to update posts')

        const { data, error } = await supabase
          .from('posts')
          .update({ content, image_url })
          .eq('id', postId)
          .eq('user_id', user.id)
          .select(
            `*, profiles:user_id (username, full_name, avatar_url)`
          )
          .single()

        if (error) throw new Error(`Failed to update post: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useUpdatePost:', error)
        throw error instanceof Error ? error : new Error('An unexpected error occurred while updating the post')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({ title: 'Post updated', description: 'Your post has been updated successfully.' })
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating post', description: error.message, variant: 'destructive' })
    },
  })
}
