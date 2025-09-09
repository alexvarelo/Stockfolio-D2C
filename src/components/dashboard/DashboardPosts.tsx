import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import { PostList } from '../social/PostList';
import { useAuth } from '@/lib/auth';

export function DashboardPosts() {
  const { user } = useAuth();
  
  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts({
    pageSize: 10, // Show 10 posts at a time
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
