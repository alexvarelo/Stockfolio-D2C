import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { PostCardV2 } from './PostCardV2';
import { Post } from '@/types/social';

type User = {
  id?: string;
  name?: string;
  avatar_url?: string;
};

// Mock hooks for like functionality
const useLikePost = () => ({
  mutate: (_: { postId: string; userId: string }, __: { onSuccess: () => void }) => {},
  isPending: false
});

const useUnlikePost = () => ({
  mutate: (_: { postId: string; userId: string }, __: { onSuccess: () => void }) => {},
  isPending: false
});

interface PostCardProps {
  post: Post & {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    has_liked: boolean;
    likes_count: number;
    comments_count: number;
    user?: {
      name?: string;
      avatar_url?: string;
    };
    portfolio_id?: string;
  };
  onCommentClick?: () => void;
  onUpdatePost?: (updatedPost: Post) => void;
}

export const PostCard = ({ post, onCommentClick, onUpdatePost }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.has_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Like/Unlike mutations
  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: unlikePost, isPending: isUnliking } = useUnlikePost();

  const handleComment = () => {
    onCommentClick?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add share functionality here
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    const params = { 
      postId: post.id, 
      userId: user.id 
    };

    if (isLiked) {
      setLikeCount(prev => Math.max(0, prev - 1));
      setIsLiked(false);
      unlikePost(params, {
        onSuccess: () => {
          onUpdatePost?.({
            ...post,
            has_liked: false,
            likes_count: Math.max(0, (post.likes_count || 0) - 1),
          });
        },
      });
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
      likePost(params, {
        onSuccess: () => {
          onUpdatePost?.({
            ...post,
            has_liked: true,
            likes_count: (post.likes_count || 0) + 1,
          });
        },
      });
    }
  };

  const postData = {
    ...post,
    user: {
      ...post.user,
      id: post.user_id
    } as User,
    comments_count: post.comments_count || 0,
    likes_count: likeCount,
    has_liked: isLiked,
  };

  return (
    <PostCardV2 
      post={postData}
      onCommentClick={handleComment}
      onUpdatePost={onUpdatePost}
      className="w-full"
    />
  );
};