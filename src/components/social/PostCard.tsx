import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, Bookmark, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Post, PostType } from '@/types/social';
import { useLikePost, useUnlikePost } from '@/api/social';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Custom styles for markdown content
const markdownStyles = `
  .wmde-markdown {
    background: transparent !important;
    color: inherit !important;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  
  .wmde-markdown p {
    margin: 0.5em 0;
  }
  
  .wmde-markdown h1, 
  .wmde-markdown h2, 
  .wmde-markdown h3 {
    margin: 1em 0 0.5em 0;
    font-weight: 600;
  }
  
  .wmde-markdown ul, 
  .wmde-markdown ol {
    margin: 0.5em 0 0.5em 1.5em;
    padding: 0;
  }
  
  .wmde-markdown blockquote {
    margin: 0.5em 0;
    padding: 0 0 0 1em;
    border-left: 3px solid hsl(var(--border));
    color: hsl(var(--muted-foreground));
  }
  
  .wmde-markdown a {
    color: hsl(var(--primary));
    text-decoration: none;
  }
  
  .wmde-markdown a:hover {
    text-decoration: underline;
  }
`;

// Dynamically import MDX with no SSR to avoid hydration issues
const MDXPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
);

const getPostTypeBadge = (type: PostType) => {
  if (!type) return null;
  
  const variants = {
    TRADE: { label: 'Trade', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    ANALYSIS: { label: 'Analysis', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    UPDATE: { label: 'Update', className: 'bg-green-50 text-green-700 border-green-200' },
  };
  
  const variant = variants[type] || null;
  return variant ? (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  ) : null;
};

interface PostCardProps {
  post: Post;
  onCommentClick?: () => void;
  onUpdatePost?: (updatedPost: Post) => void;
}

export const PostCard = ({ post, onCommentClick, onUpdatePost }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Like/Unlike mutations
  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: unlikePost, isPending: isUnliking } = useUnlikePost();

  const handleLike = () => {
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

    if (post.has_liked) {
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

  return (
    <Card className="w-full overflow-hidden border-0 shadow-sm">
      <style>{markdownStyles}</style>
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user?.avatar_url} alt={post.user?.name} />
            <AvatarFallback className="text-xs">
              {post.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{post.user?.name || 'User'}</h3>
              {getPostTypeBadge(post.post_type)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              {post.updated_at !== post.created_at && ' • Edited'}
            </p>
          </div>
          
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-2 text-sm">
          <MDXPreview source={post.content} />
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="bg-blue-500 text-white p-0.5 rounded-full">
              <Heart className="h-2.5 w-2.5" />
            </div>
            <span>{post.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{post.comments_count || 0} comments</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-0 border-t">
        <div className="grid grid-cols-3 w-full divide-x">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none gap-2 h-10 text-sm font-normal"
            onClick={handleLike}
            disabled={isLiking || isUnliking}
          >
            {isLiking || isUnliking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : post.has_liked ? (
              <Heart className="h-4 w-4 fill-current text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            <span className={cn(post.has_liked && 'text-red-500')}>
              Like
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none gap-2 h-10 text-sm font-normal"
            onClick={onCommentClick}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-none gap-2 h-10 text-sm font-normal"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};