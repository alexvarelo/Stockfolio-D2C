import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import { PostList } from '../social/PostList';
import { useAuth } from '@/lib/auth';

interface DashboardPostsProps {
  pageSize?: number;
}

export function DashboardPosts({ pageSize = 10 }: DashboardPostsProps) {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts({
    pageSize,
    excludeUserId: user?.id, // Exclude current user's posts
  });

  // Flatten all pages of posts
  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <PostList 
      posts={posts}
      isLoading={isLoading}
      isError={!!error}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
    />
  );
}
