import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useUserProfile } from '@/api/user/user';
import { useUpdateProfile } from '@/api/user/updateProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  full_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  bio: z.string().max(160).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(user?.id || '');
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
    },
  });

  // Update form default values when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
      });
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('full_name', data.full_name);
      if (data.bio) formData.append('bio', data.bio);
      if (data.website) formData.append('website', data.website);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await updateProfile.mutateAsync({
        userId: user.id,
        data: formData,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Navigate back to profile using the new /user/:userId format
      navigate(`/user/${user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} alt={profile?.full_name} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us a little bit about yourself" 
                    className="resize-none" 
                    rows={4} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProfilePage;
