import React from 'react';
import { useDiscoverCommunities, useCommunities } from '@/hooks/useCommunities';
import CommunityCard from './CommunityCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DiscoverCommunities({ onClose }: { onClose?: () => void }) {
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const { data: communities = [], isLoading, refetch } = useDiscoverCommunities(q, page, 12);
  const { data: userCommunities = [] } = useCommunities();

  const userCommunityIds = React.useMemo(() => new Set(userCommunities.map((c: any) => c.id)), [userCommunities]);

  React.useEffect(() => {
    refetch();
  }, [q, page, refetch]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>      <div className="bg-background w-full max-w-4xl mx-4 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Discover Communities</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search communities"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded px-3 py-1 bg-card"
            />
            <Button variant="ghost" onClick={() => onClose?.()}>Close</Button>
          </div>
        </div>

        {isLoading && <div className="py-8 text-center">Loading...</div>}

        {!isLoading && communities.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No communities found</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c: any) => (
            <CommunityCard key={c.id} community={c} isMember={userCommunityIds.has(c.id)} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <div className="text-sm text-muted-foreground">Page {page}</div>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Next</Button>        </div>
      </div>
    </div>
  );
}
