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
import { useUpdateWatchlist } from '@/api/watchlist/useWatchlists';
import { Loader2 } from 'lucide-react';

const watchlistFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  is_public: z.boolean().default(false),
});

type WatchlistFormValues = z.infer<typeof watchlistFormSchema>;

interface EditWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchlist: {
    id: string;
    name: string;
    description?: string | null;
    is_public: boolean;
  };
  onSuccess?: () => void;
}

export function EditWatchlistDialog({ 
  open, 
  onOpenChange, 
  watchlist, 
  onSuccess 
}: EditWatchlistDialogProps) {
  const updateWatchlist = useUpdateWatchlist();
  
  const form = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      name: watchlist.name,
      description: watchlist.description || '',
      is_public: watchlist.is_public,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: watchlist.name,
        description: watchlist.description || '',
        is_public: watchlist.is_public,
      });
    }
  }, [open, watchlist, form]);

  const onSubmit = async (data: WatchlistFormValues) => {
    try {
      await updateWatchlist.mutateAsync({
        id: watchlist.id,
        ...data,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  console.log("isOpen", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Watchlist</DialogTitle>
          <DialogDescription>
            Update the details of your watchlist.
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
              disabled={updateWatchlist.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateWatchlist.isPending}>
              {updateWatchlist.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
