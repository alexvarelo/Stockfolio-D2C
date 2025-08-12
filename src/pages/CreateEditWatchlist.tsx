import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateWatchlist, useUpdateWatchlist, useWatchlists } from '@/api/watchlist/useWatchlists';
import { ArrowLeft, Loader2 } from 'lucide-react';

const watchlistFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  is_public: z.boolean().default(false),
});

type WatchlistFormValues = z.infer<typeof watchlistFormSchema>;

export function CreateEditWatchlist() {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  // If in edit mode, find the existing watchlist from the list
  const { data: watchlists, isLoading } = useWatchlists();
  const existingWatchlist = id ? watchlists?.find(w => w.id === id) : null;
  
  const createWatchlist = useCreateWatchlist();
  const updateWatchlist = useUpdateWatchlist();
  
  const form = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_public: false,
    },
  });
  
  // If in edit mode and watchlist is loaded, set the form values
  React.useEffect(() => {
    if (isEditMode && existingWatchlist) {
      form.reset({
        name: existingWatchlist.name,
        description: existingWatchlist.description || '',
        is_public: existingWatchlist.is_public,
      });
    }
  }, [existingWatchlist, form, isEditMode]);
  
  const onSubmit = async (data: WatchlistFormValues) => {
    try {
      if (isEditMode && id) {
        await updateWatchlist.mutateAsync({
          id,
          ...data,
        });
      } else {
        // Ensure name is provided as it's required
        if (!data.name) {
          throw new Error('Name is required');
        }
        await createWatchlist.mutateAsync({
          name: data.name,
          description: data.description,
          is_public: data.is_public || false,
        });
      }
      
      navigate(isEditMode ? `/watchlists/${id}` : '/watchlists');
    } catch (error) {
      console.error('Failed to save watchlist:', error);
    }
  };
  
  if ((isLoading || (isEditMode && !existingWatchlist)) && isEditMode) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Loading watchlist...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="pl-0" 
          onClick={() => navigate(isEditMode ? `/watchlists/${id}` : '/watchlists')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {isEditMode ? 'Watchlist' : 'Watchlists'}
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Edit Watchlist' : 'Create New Watchlist'}
            </CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Update your watchlist details below.'
                : 'Create a new watchlist to track your favorite stocks.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Tech Stocks, Dividend Portfolio"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a brief description of this watchlist"
                    className="min-h-[100px]"
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_public" 
                    onCheckedChange={(checked) => 
                      form.setValue('is_public', checked === true)
                    }
                    checked={form.watch('is_public')}
                  />
                  <Label htmlFor="is_public" className="font-normal">
                    Make this watchlist public
                  </Label>
                </div>
                
                {form.watch('is_public') && (
                  <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                    <p>Public watchlists can be viewed by anyone with the link.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(isEditMode ? `/watchlists/${id}` : '/watchlists')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting 
                    ? 'Saving...' 
                    : isEditMode 
                      ? 'Update Watchlist' 
                      : 'Create Watchlist'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
