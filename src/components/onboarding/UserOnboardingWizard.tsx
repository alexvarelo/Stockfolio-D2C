import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarSelector } from '@/components/profile/AvatarSelector';

const onboardingSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url('Must be a valid URL').optional(),
});

type OnboardingFields = z.infer<typeof onboardingSchema>;

interface UserOnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  email: string;
  isEditMode?: boolean;
  initialData?: {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  };
}

export function UserOnboardingWizard({ 
  open, 
  onComplete, 
  userId, 
  email,
  isEditMode = false,
  initialData = {}
}: UserOnboardingWizardProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialData.avatar_url || null);

  const form = useForm<OnboardingFields>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { 
      username: initialData.username || '', 
      full_name: initialData.full_name || '', 
      bio: initialData.bio || '', 
      avatar_url: initialData.avatar_url || '' 
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        username: initialData.username || '',
        full_name: initialData.full_name || '',
        bio: initialData.bio || '',
        avatar_url: initialData.avatar_url || ''
      });
      setSelectedAvatar(initialData.avatar_url || null);
    }
  }, [initialData]);

  const handleSubmit = async (fields: OnboardingFields) => {
    setLoading(true);
    const updates = {
      id: userId,
      email,
      username: fields.username,
      full_name: fields.full_name,
      bio: fields.bio,
      avatar_url: selectedAvatar || fields.avatar_url,
      updated_at: new Date().toISOString(),
    };

    if (isEditMode) {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
      
      setLoading(false);
      if (!error) onComplete();
    } else {
      const { error } = await supabase.from('users').insert({
        ...updates,
        is_verified: true,
      });
      
      setLoading(false);
      if (!error) onComplete();
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    form.setValue('avatar_url', avatarUrl);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Profile' : 'Complete Your Profile'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl><Input placeholder="yourname" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avatar_url" render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedAvatar || field.value} />
                    <AvatarFallback>{(form.watch('full_name') || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <AvatarSelector 
                      onSelect={handleAvatarSelect} 
                      currentAvatarUrl={selectedAvatar || field.value} 
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Biography</FormLabel>
                <FormControl><Input placeholder="Tell us about yourself" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avatar_url" render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
