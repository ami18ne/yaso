import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'
import { useAuthenticatedMutation } from './useAuthenticatedMutation'

const POSTS_PER_PAGE = 10

// ... (Keep the Post interface as is)

export function usePosts() {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        if (error.message && error.message.includes('does not exist')) {
          logger.log('Posts table does not exist, returning empty array.')
          return []
        }
        throw error
      }

      if (!user || posts.length === 0) {
        return posts || []
      }

      const postIds = posts.map((p) => p.id)

      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      const { data: saves } = await supabase
        .from('saves')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      const likedPostIds = new Set(likes?.map((l) => l.post_id) || [])
      const savedPostIds = new Set(saves?.map((s) => s.post_id) || [])

      return posts.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      }))
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < POSTS_PER_PAGE) {
        return undefined
      }
      return allPages.length
    },
  })
}

export function useCreatePost() {
  const { toast } = useToast()

  return useAuthenticatedMutation(
    async ({ content, image_url }, user) => {
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
    },
    {
      onSuccess: () => {
        toast({
          title: 'Post created!',
          description: 'Your post has been published successfully.',
        })
      },
      onError: (error) => {
        // The generic error toast is already handled, this is for specific actions
      },
    }
  )
}

export function useLikePost() {
  return useAuthenticatedMutation(async ({ postId, isLiked }, user) => {
    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) throw new Error(`Failed to unlike post: ${error.message}`)
    } else {
      const { error } = await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }])

      if (error) throw new Error(`Failed to like post: ${error.message}`)
    }
  })
}

export function useSavePost() {
  return useAuthenticatedMutation(
    async ({ postId, isSaved }, user) => {
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
    },
    {
      onSuccess: () => {
        /* Invalidation is handled by the hook */
      },
    }
  )
}

export function useDeletePost() {
  const { toast } = useToast()

  return useAuthenticatedMutation(
    async ({ postId, imageUrl }, user) => {
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
          // Do not rethrow, as the post itself was deleted
        }
      }
    },
    {
      onSuccess: () => {
        toast({
          title: 'Post deleted',
          description: 'Your post has been removed.',
        })
      },
    }
  )
}

export function useUpdatePost() {
  const { toast } = useToast()
  return useAuthenticatedMutation(
    async ({ postId, content, image_url }, user) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ content, image_url })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select(`*, profiles:user_id (username, full_name, avatar_url)`)
        .single()

      if (error) throw new Error(`Failed to update post: ${error.message}`)
      return data
    },
    {
      onSuccess: () => {
        toast({ title: 'Post updated', description: 'Your post has been updated successfully.' })
      },
    }
  )
}

export function usePostReactions(postId: string) {
  return useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      if (!postId) return []

      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction, user_id, profiles:user_id (username)')
        .eq('post_id', postId)

      if (error) {
        logger.error('Error fetching post reactions', error)
        throw error
      }
      return data || []
    },
    enabled: !!postId,
  })
}

export function useTogglePostReaction() {
  const queryClient = useQueryClient()
  return useAuthenticatedMutation(
    async ({ postId, reaction }: { postId: string; reaction: string }, user) => {
      const { data: existingReaction, error: fetchError } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw new Error(`Failed to check for existing reaction: ${fetchError.message}`)
      }

      if (existingReaction) {
        const { error: updateError } = await supabase
          .from('post_reactions')
          .update({ reaction })
          .eq('id', existingReaction.id)
        if (updateError) throw new Error(`Failed to update reaction: ${updateError.message}`)
      } else {
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert([{ post_id: postId, user_id: user.id, reaction }])
        if (insertError) throw new Error(`Failed to add reaction: ${insertError.message}`)
      }
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['post-reactions', variables.postId] })
      },
      onError: (error) => {
        logger.error('Failed to toggle post reaction', error)
      },
    }
  )
}

export function useSavedPosts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('saves')
        .select(`
                    posts:post_id (*, profiles:user_id(username, full_name, avatar_url))
                `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching saved posts', error)
        throw error
      }

      return data?.map((item) => item.posts) || []
    },
    enabled: !!user,
  })
}
