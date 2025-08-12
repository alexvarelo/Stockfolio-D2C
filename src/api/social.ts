import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Post, CreatePostDto, PostType, Comment } from '@/types/social';
import { useToast } from '@/components/ui/use-toast';

interface GetPostsParams {
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  onlyFollowing?: boolean;
  portfolioId?: string;
  postType?: PostType;
  userId?: string;
}

interface CheckFollowingParams {
  followerId: string;
  followingId: string;
}

type SupabaseRPCResponse<T> = {
  data: T;
  error: any;
  count?: number;
};

const useSupabaseRPC = async <T>(rpc: string, params: Record<string, any> = {}): Promise<SupabaseRPCResponse<T>> => {
  const { data, error, count } = await (supabase.rpc as any)(rpc, params);
  return { data, error, count };
};

export const useGetPosts = (params: GetPostsParams = {}) => {
  const { toast } = useToast();

  const queryFn = async () => {
    const { data, error, count } = await useSupabaseRPC<Post[]>('get_posts_with_details', {
      p_is_public: params.isPublic ?? true,
      p_limit: params.limit ?? 10,
      p_offset: params.offset ?? 0,
      p_only_following: params.onlyFollowing ?? false,
      p_portfolio_id: params.portfolioId,
      p_post_type: params.postType,
      p_user_id: params.userId
    });

    if (error) throw error;
    return { data, count };
  };

  const result = useQuery<{ data: Post[]; count: number | undefined }, Error>({
    queryKey: ['posts', params],
    queryFn
  });

  useEffect(() => {
    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      });
    }
  }, [result.error, toast]);

  return result;
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Post, Error, CreatePostDto>({
    mutationFn: async (postData) => {
      const { data, error } = await useSupabaseRPC<Post>('create_post', {
        p_user_id: postData.user_id, // Required
        p_content: postData.content,  // Required
        p_post_type: postData.post_type || 'GENERAL',
        p_is_public: postData.is_public ?? true,
        p_portfolio_id: postData.portfolio_id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export interface LikePostParams {
  postId: string;
  userId: string;
}

export interface AddCommentParams {
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
}

export interface FollowUserParams {
  followerId: string;
  followingId: string;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean }, Error, LikePostParams>({
    mutationFn: async ({ postId, userId }) => {
      const { data, error } = await useSupabaseRPC<{ success: boolean }>('add_post_like', {
        post_id: postId,
        user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to like post',
        variant: 'destructive',
      });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean }, Error, LikePostParams>({
    mutationFn: async ({ postId, userId }) => {
      const { data, error } = await useSupabaseRPC<{ success: boolean }>('remove_post_like', {
        post_id: postId,
        user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unlike post',
        variant: 'destructive',
      });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Comment, Error, AddCommentParams>({
    mutationFn: async ({ postId, userId, content, parentCommentId }) => {
      const { data, error } = await useSupabaseRPC<Comment>('add_post_comment', {
        post_id: postId,
        user_id: userId,
        comment_content: content,
        parent_comment_id: parentCommentId || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean }, Error, FollowUserParams>({
    mutationFn: async ({ followerId, followingId }) => {
      const { data, error } = await useSupabaseRPC<{ success: boolean }>('follow_user', {
        follower_id: followerId,
        following_id: followingId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
      queryClient.invalidateQueries({ queryKey: ['user-following'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow user',
        variant: 'destructive',
      });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ success: boolean }, Error, FollowUserParams>({
    mutationFn: async ({ followerId, followingId }) => {
      const { data, error } = await useSupabaseRPC<{ success: boolean }>('unfollow_user', {
        follower_id: followerId,
        following_id: followingId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
      queryClient.invalidateQueries({ queryKey: ['user-following'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow user',
        variant: 'destructive',
      });
    },
  });
};

export const useIsFollowing = (followerId: string | undefined, followingId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery<boolean, Error>({
    queryKey: ['is-following', followerId, followingId],
    queryFn: async () => {
      if (!followerId || !followingId) return false;
      
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    },
    enabled: !!followerId && !!followingId,
  });

  return {
    isFollowing: data || false,
    isLoading,
    error,
    refetch,
  };
};
