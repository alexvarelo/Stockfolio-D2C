import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import { PostList } from '../social/PostList';

export function DashboardPosts() {
  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts({
    pageSize: 10, // Show 10 posts at a time
  });

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
