import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import { PostList } from "@/components/social/PostList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InstrumentPostsProps {
  ticker: string;
}

export function InstrumentPosts({ ticker }: InstrumentPostsProps) {
  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts({
    tickerId: ticker,
    pageSize: 5, // Show 5 posts at a time
  });

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Community Discussions</h2>
      <br />
      <PostList 
        posts={posts}
        isLoading={isLoading}
        isError={!!error}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
      
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No discussions about this instrument yet. Be the first to start a discussion!
        </div>
      )}
    </div>
  );
}
