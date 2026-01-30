import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useCommunityRole(communityId: string | null) {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!communityId || !user) {
      setRole(null);
      return;
    }

    async function fetchRole() {
      setLoading(true);
      try {
        const response = await fetch(`/api/communities/${communityId}/role?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      }
      setLoading(false);
    }

    fetchRole();
  }, [communityId, user]);

  return { role, loading };
}
