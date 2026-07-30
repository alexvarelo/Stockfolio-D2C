import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface UserSettings {
  user_id: string;
  default_currency: string;
  email_notifications: boolean;
  push_notifications: boolean;
  portfolio_visibility: 'PRIVATE' | 'FOLLOWERS' | 'PUBLIC';
  timezone: string;
}

// user_settings has a row-per-user default seeded elsewhere, but no
// frontend code has ever read/written it before — this is new plumbing,
// not a tweak to an existing hook.
export const useUserSettings = (userId?: string) => {
  return useQuery<UserSettings | null>({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserSettings> }) => {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
      // The base currency affects every portfolio total on screen
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-basic'] });
      toast({ title: 'Settings updated' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
