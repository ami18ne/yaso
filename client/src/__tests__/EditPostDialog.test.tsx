import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import EditPostDialog from '@/components/EditPostDialog'

vi.mock('@/hooks/usePosts', () => ({
  useUpdatePost: () => ({ mutateAsync: vi.fn().mockResolvedValue({ id: '1', content: 'updated' }), isPending: false }),
}))

// Provide minimal language context so component can render text
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k, language: 'en', isRTL: false, setLanguage: () => {} }),
}))

describe('EditPostDialog', () => {
  it('renders and calls save', async () => {
    const onOpenChange = vi.fn()
    render(<EditPostDialog open={true} onOpenChange={onOpenChange} postId="1" initialContent="hello" />)

    const saveBtn = screen.getByText(/Save|حفظ/)
    expect(saveBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
