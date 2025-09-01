import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { PortfolioPostCard } from './PortfolioPostCard';
import { InstrumentPostCard } from './InstrumentPostCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface PostCardV2Props {
  post: {
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
    ticker?: string;
  };
  onCommentClick?: () => void;
  onUpdatePost?: (updatedPost: any) => void;
  className?: string;
}

export const PostCardV2 = ({ 
  post, 
  onCommentClick, 
  onUpdatePost, 
  className 
}: PostCardV2Props) => {
  const [isLiked, setIsLiked] = useState(post.has_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock hooks for like functionality
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
      // In a real implementation, this would call your API
      onUpdatePost?.({
        ...post,
        has_liked: false,
        likes_count: Math.max(0, (post.likes_count || 0) - 1),
      });
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
      // In a real implementation, this would call your API
      onUpdatePost?.({
        ...post,
        has_liked: true,
        likes_count: (post.likes_count || 0) + 1,
      });
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add share functionality here
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto rounded-xl overflow-hidden transition-all duration-200",
      "bg-card text-card-foreground shadow-sm border border-border",
      "hover:shadow-md hover:border-border/80",
      className
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.avatar_url} alt={post.user?.name || 'User'} />
              <AvatarFallback>{(post.user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground line-clamp-1">
                  {post.user?.name || 'Anonymous'}
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mt-3 text-foreground">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>

        {/* Portfolio or Instrument Card */}
        <div className="mt-6 space-y-4">
          {post.portfolio_id && <PortfolioPostCard portfolioId={post.portfolio_id} />}
          {post.ticker && <InstrumentPostCard ticker={post.ticker} />}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 group px-2"
              onClick={handleComment}
            >
              <MessageCircle className="h-4 w-4 group-hover:text-blue-500" />
              <span className="text-sm group-hover:text-blue-500">
                {post.comments_count || 0}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 group px-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''} group-hover:text-red-500`} />
              <span className={`text-sm group-hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}>
                {likeCount}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 group px-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 group-hover:text-green-500" />
              <span className="text-sm group-hover:text-green-500">
                Share
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
