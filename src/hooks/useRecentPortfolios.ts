import { useQuery } from '@tanstack/react-query';

export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other portfolio properties as needed
}

export function useRecentPortfolios({ enabled = true, limit = 3 } = {}) {
  return useQuery<Portfolio[]>({
    queryKey: ['recent-portfolios'],
    queryFn: async () => {
      // TODO: Replace with actual API call to fetch recent portfolios
      // This is a mock implementation
      return [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useRecentPortfolios;
