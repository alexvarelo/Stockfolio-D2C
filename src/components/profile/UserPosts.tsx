import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import { PostCard } from '../social/PostCard';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export const UserPosts = ({ userId }: { userId: string }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfinitePosts({
    authorId: userId,
    pageSize: 5,
    isPublic: true
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg bg-muted/20 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error loading posts: {error?.message}
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet. When you create posts, they'll appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
