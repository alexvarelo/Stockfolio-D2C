import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to determine if the logged-in user needs onboarding (no row in users table)
 */
export function useNeedsOnboarding(userId?: string) {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        console.log(data, error);
        setNeedsOnboarding(!data);
        setLoading(false);
      });
  }, [userId]);

  return { needsOnboarding, loading };
}
