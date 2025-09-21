import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BasicUserInfo {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export function useUsersByIds(ids: string[]) {
  return useQuery<BasicUserInfo[]>({
    queryKey: ['users-by-ids', ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', ids);
      if (error) throw error;
      return data || [];
    },
    enabled: !!ids.length
  });
}
