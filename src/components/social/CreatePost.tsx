import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useCreatePost } from '@/api/social';
import { MarkdownEditor } from './MarkdownEditor';
import { useAuth } from '@/lib/auth';
import { CreatePostDto } from '@/types/social';
import { MessageSquare, X, Maximize2, Minimize2 } from 'lucide-react';

interface CreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

export const CreatePost = ({ onPostCreated, className }: CreatePostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();
  const { toast } = useToast();
  const { handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<{ content: string }>();
  
  const content = watch('content', '');
  
  const handleContentChange = (value: string) => {
    setValue('content', value, { shouldValidate: true });
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const onSubmit = (data: { content: string }) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post',
        variant: 'destructive',
      });
      return;
    }

    const postData: CreatePostDto = {
      user_id: user.id,
      content: data.content,
      post_type: 'GENERAL', // Default post type
      is_public: true, // Default to public
    };

    createPost(postData, {
      onSuccess: () => {
        reset();
        toast({
          title: 'Success',
          description: 'Your post has been published',
        });
        onPostCreated?.();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create post',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className={cn('bg-card rounded-lg border transition-all', className, {
      'p-2': !isExpanded,
      'p-4': isExpanded
    })}>
      {!isExpanded ? (
        <div 
          className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex-1 text-muted-foreground ml-2">
            What are your thoughts?
          </div>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Create post</h3>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleExpand}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              className={errors.content ? 'border-red-500' : ''}
              placeholder="What are your thoughts?"
              minHeight={isExpanded ? 120 : 80}
              autoFocus
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">
                {errors.content.message}
              </p>
            )}
            <div className="mt-1 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {content.length}/1000 characters
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    reset();
                    if (content.length === 0) {
                      setIsExpanded(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !content.trim()}
                  size="sm"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
