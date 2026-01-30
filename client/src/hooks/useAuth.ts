import useSWR from 'swr';
import { User } from '@shared/schema';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useAuth() {
  const { data, error } = useSWR<{ user: User | null }>('/api/auth/me', fetcher);

  return {
    user: data?.user,
    loading: !data && !error,
    error: error,
  };
}
