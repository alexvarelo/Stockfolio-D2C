import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useAddComment } from '@/hooks/usePostActions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

interface PostCommentsProps {
  postId: string;
  comments: Comment[];
  onCommentAdded?: () => void;
  className?: string;
}

export const PostComments = ({
  postId,
  comments = [],
  onCommentAdded,
  className = '',
}: PostCommentsProps) => {
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: addComment, isPending } = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment(
      { 
        post_id: postId, 
        content: comment.trim() 
      },
      {
        onSuccess: () => {
          setComment('');
          onCommentAdded?.();
        },
        onError: (error) => {
          toast({
            title: 'Error adding comment',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn('mt-2 border-t border-border pt-3', className)}>
      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name} />
            <AvatarFallback>{(user.user_metadata?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[40px] max-h-32 resize-none pr-10"
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 bottom-1 h-8 w-8"
              disabled={!comment.trim() || isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.length > 2 && !isExpanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground text-sm px-0 h-auto"
              onClick={toggleComments}
            >
              View {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Button>
          )}
          
          <div className={cn('space-y-4', !isExpanded && comments.length > 2 ? 'hidden' : 'block')}>
            {(isExpanded ? comments : comments.slice(-2)).map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar_url} alt={comment.user.name} />
                  <AvatarFallback>{(comment.user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/30 rounded-lg p-2 text-sm">
                  <div className="font-medium">{comment.user.name || 'Anonymous'}</div>
                  <p className="text-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
