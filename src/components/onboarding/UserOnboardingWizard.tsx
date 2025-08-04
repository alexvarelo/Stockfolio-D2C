import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const onboardingSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url('Must be a valid URL').optional(),
});

type OnboardingFields = z.infer<typeof onboardingSchema>;

export function UserOnboardingWizard({ open, onComplete, userId, email }: {
  open: boolean;
  onComplete: () => void;
  userId: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<OnboardingFields>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { username: '', full_name: '', bio: '', avatar_url: '' },
  });

  const handleSubmit = async (fields: OnboardingFields) => {
    setLoading(true);
    const { error } = await supabase.from('users').insert({
      id: userId,
      email,
      username: fields.username,
      full_name: fields.full_name,
      bio: fields.bio,
      avatar_url: fields.avatar_url,
      is_verified: true,
    });
    setLoading(false);
    if (!error) onComplete();
    // Optionally handle error
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
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
