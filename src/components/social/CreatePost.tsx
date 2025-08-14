import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useCreatePost } from '@/api/social';
import { MarkdownEditor } from './MarkdownEditor';
import { useAuth } from '@/lib/auth';
import { CreatePostDto } from '@/types/social';
import { MessageSquare, FolderOpen } from 'lucide-react';
import { usePortfolios } from '@/api/portfolio/usePortfolios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type FormValues = {
  content: string;
  portfolioId?: string;
};

interface CreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

export const CreatePost = ({ onPostCreated, className }: CreatePostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { data: portfolios = [], isLoading: isLoadingPortfolios } = usePortfolios(user?.id);
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();
  const { toast } = useToast();
  
  const { 
    handleSubmit, 
    reset, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<FormValues>();
  
  const content = watch('content', '');
  const selectedPortfolioId = watch('portfolioId');
  
  const handleContentChange = (value: string) => {
    setValue('content', value, { shouldValidate: true });
  };

  const onSubmit = (data: FormValues) => {
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
      post_type: 'GENERAL',
      is_public: true,
      portfolio_id: data.portfolioId || null,
    };

    createPost(postData, {
      onSuccess: () => {
        reset();
        setIsExpanded(false);
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

  if (!isExpanded) {
    return (
      <div 
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground',
          'hover:bg-accent/50 cursor-pointer transition-colors',
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex-1 text-muted-foreground ml-1">
          What are your thoughts?
        </div>
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <MarkdownEditor
          value={content}
          onChange={handleContentChange}
          placeholder="What's on your mind?"
          className="min-h-[100px]"
          autoFocus
        />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="portfolioId" className="text-sm text-muted-foreground">
              Link to portfolio (optional)
            </Label>
          </div>
          <Select 
            value={selectedPortfolioId || 'none'}
            onValueChange={(value) => setValue('portfolioId', value === 'none' ? undefined : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a portfolio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No portfolio</SelectItem>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name} {!portfolio.is_public && '(Private)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {errors.content && (
          <p className="text-sm text-red-500">
            {errors.content.message}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-2">
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
                setIsExpanded(false);
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
      </form>
    </div>
  );
};
