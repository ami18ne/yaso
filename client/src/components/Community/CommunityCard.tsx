import React from 'react';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CommunityCard({ community, isMember }: { community: any, isMember: boolean }) {
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to join communities');
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await joinMutation.mutateAsync({ communityId: community.id });
      setLocation(`/communities/${community.id}`);
    } catch (err) {
      console.error('Join error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to leave communities');
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await leaveMutation.mutateAsync({ communityId: community.id });
    } catch (err) {
      console.error('Leave error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold">{community.name}</h4>
          <span className="text-xs px-2 py-0.5 bg-muted rounded">{community.visibility || 'public'}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{community.description || 'No description'}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{community.members_count ? `${community.members_count} members` : ''}</div>
        {isMember ? (
          <Button
            onClick={handleLeave}
            disabled={isProcessing}
            variant="outline"
            size="sm"
          >
            {isProcessing ? 'Leaving...' : 'Leave'}
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? 'Joining...' : 'Join'}
          </Button>
        )}
      </div>
    </div>
  );
}
