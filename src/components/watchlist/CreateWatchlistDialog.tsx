import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCreateWatchlist } from '@/api/watchlist/useWatchlists';
import { Loader2 } from 'lucide-react';

const watchlistFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  is_public: z.boolean().default(false),
});

type WatchlistFormValues = z.infer<typeof watchlistFormSchema>;

interface CreateWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
}

export function CreateWatchlistDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateWatchlistDialogProps) {
  const createWatchlist = useCreateWatchlist();
  
  const form = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_public: false,
    },
    mode: 'onChange',  // Enable validation on change for better UX
  });

  const onSubmit = async (data: WatchlistFormValues) => {
    try {
      // Ensure name is always a string and not undefined
      const result = await createWatchlist.mutateAsync({
        name: data.name || '', // This should never be undefined due to form validation
        description: data.description,
        is_public: data.is_public,
      });
      
      onSuccess?.(result.id);
      onOpenChange(false);
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Failed to create watchlist:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Watchlist</DialogTitle>
          <DialogDescription>
            Create a new watchlist to track your favorite stocks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Watchlist"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="A short description of your watchlist"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              {...form.register('is_public')}
              checked={form.watch('is_public')}
              onCheckedChange={(checked) => form.setValue('is_public', Boolean(checked))}
            />
            <Label htmlFor="is_public" className="text-sm font-medium leading-none">
              Make this watchlist public
            </Label>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createWatchlist.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWatchlist.isPending}>
              {createWatchlist.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Watchlist'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
