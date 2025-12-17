import React from 'react'
import { useDiscoverCommunities } from '@/hooks/useCommunities'
import CommunityCard from './CommunityCard'

export default function DiscoverCommunities({ onClose }: { onClose?: () => void }) {
  const [q, setQ] = React.useState('')
  const [page, setPage] = React.useState(1)
  const { data: communities = [], isLoading, refetch } = useDiscoverCommunities(q, page, 12)

  React.useEffect(() => {
    refetch()
  }, [q, page])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background w-full max-w-4xl mx-4 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Discover Communities</h3>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search communities"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded px-3 py-1 bg-card"
            />
            <button onClick={() => onClose?.()} className="text-sm text-muted-foreground">Close</button>
          </div>
        </div>

        {isLoading && <div className="py-8 text-center">Loading...</div>}

        {!isLoading && communities.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No communities found</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c: any) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Previous</button>
          <div className="text-sm text-muted-foreground">Page {page}</div>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border">Next</button>
        </div>
      </div>
    </div>
  )
}
