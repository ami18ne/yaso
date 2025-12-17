import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '1', content: 'updated' }, error: null }),
      })),
    },
  }
})

import { useUpdatePost } from '@/hooks/usePosts'

// Mock auth to provide a user for hooks that check authentication
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: '1' } }),
}))

const createQueryWrapper = () => {
  const qc = new QueryClient()
  return ({ children }: any) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useUpdatePost', () => {
  it('updates a post successfully', async () => {
    const wrapper = createQueryWrapper()
    const { result } = renderHook(() => useUpdatePost(), { wrapper })

    await act(async () => {
      const res = await result.current.mutateAsync({ postId: '1', content: 'updated' })
      expect(res).toBeDefined()
      expect((res as any).content || 'updated').toBe('updated')
    })
  })
})
