import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CommentData {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface LikeData {
  post_id: string;
  user_id: string;
}

// Like a post
export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ post_id }: { post_id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('post_likes')
        .insert({ post_id, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { post_id }) => {
      // Invalidate and refetch the posts query
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post_id] });
    },
    onError: (error) => {
      toast({
        title: 'Error liking post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Unlike a post
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ post_id }: { post_id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { post_id };
    },
    onSuccess: (_, { post_id }) => {
      // Invalidate and refetch the posts query
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post_id] });
    },
    onError: (error) => {
      toast({
        title: 'Error unliking post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Add a comment to a post
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ post_id, content, parent_comment_id }: CommentData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id,
          user_id: user.id,
          content,
          parent_comment_id: parent_comment_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { post_id }) => {
      // Invalidate and refetch the post comments
      queryClient.invalidateQueries({ queryKey: ['post-comments', post_id] });
      queryClient.invalidateQueries({ queryKey: ['post', post_id] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding comment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId }: { commentId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First verify the comment belongs to the user
      const { data: comment, error: fetchError } = await supabase
        .from('post_comments')
        .select('id, user_id')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;
      if (comment.user_id !== user.id) {
        throw new Error('Unauthorized to delete this comment');
      }

      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { commentId };
    },
    onSuccess: (_, { commentId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting comment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
