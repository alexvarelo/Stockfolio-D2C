import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from './PostCard';
import { Post } from '@/types/social';

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export const PostList = ({
  posts = [],
  isLoading = false,
  isError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: PostListProps) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load posts. Please try again later.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">
          Failed to load posts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts to display.
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" />
          {!hasNextPage && posts.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              You've reached the end of the feed
            </div>
          )}
        </>
      )}
    </div>
  );
};
