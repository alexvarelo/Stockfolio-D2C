import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Post, PostType, User } from '@/types/social';

// Define the raw post type returned by the RPC
interface RawPost {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  content: string;
  post_type: PostType;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface UseInfinitePostsOptions {
  pageSize?: number;
  isPublic?: boolean;
  onlyFollowing?: boolean;
  portfolioId?: string;
  postType?: PostType;
  userId?: string;
  authorId?:string;
}

interface PageData {
  data: Post[];
  count: number | undefined;
  page: number;
}

const fetchPosts = async ({
  pageParam = 1,
  pageSize = 10,
  ...restOptions
}: {
  pageParam: number;
  pageSize: number;
  isPublic?: boolean;
  onlyFollowing?: boolean;
  portfolioId?: string;
  postType?: PostType;
  userId?: string;
  authorId?: string;
}): Promise<PageData> => {
  const offset = (pageParam - 1) * pageSize;
  
  // Use type assertion to bypass the RPC function name type check
  const { data, error, count } = await (supabase.rpc as any)('get_posts_with_details', {
    p_is_public: restOptions.isPublic ?? true,
    p_limit: pageSize,
    p_offset: offset,
    p_only_following: restOptions.onlyFollowing ?? false,
    p_portfolio_id: restOptions.portfolioId || null,
    p_post_type: restOptions.postType || null,
    p_user_id: restOptions.userId || null,
    p_author_id: restOptions.authorId || null,
  });

  if (error) {
    throw error;
  }

  // Transform the raw RPC response to match our Post type
  const postsData: Post[] = (Array.isArray(data) ? data : []).map(rawPost => ({
    id: rawPost.id,
    user_id: rawPost.user_id,
    portfolio_id: rawPost.portfolio_id || undefined,
    content: rawPost.content,
    post_type: rawPost.post_type,
    is_public: rawPost.is_public,
    created_at: rawPost.created_at,
    updated_at: rawPost.updated_at,
    user: {
      id: rawPost.user_id,
      name: rawPost.username,
      avatar_url: rawPost.avatar_url || undefined,
    },
    likes_count: rawPost.likes_count,
    comments_count: rawPost.comments_count,
    has_liked: rawPost.is_liked,
    ticker: rawPost.ticker
  }));

  return {
    data: postsData,
    count: count || 0,
    page: pageParam,
  };
};

export const useInfinitePosts = (options: UseInfinitePostsOptions = { pageSize: 10 }) => {
  const { pageSize = 10, ...restOptions } = options;
  const queryKey = ['posts', 'infinite', restOptions];

  return useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPosts({ 
      pageParam, 
      pageSize, 
      ...restOptions 
    }),
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage.count || 0;
      const loadedItems = allPages.reduce((acc, page) => acc + (page.data?.length || 0), 0);
      
      if (loadedItems >= totalItems) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
