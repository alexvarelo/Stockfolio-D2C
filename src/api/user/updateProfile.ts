import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type UpdateProfileData = {
  username: string;
  full_name: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: FormData | UpdateProfileData;
    }) => {
      // If it's a FormData (for file upload), handle it differently
      if (data instanceof FormData) {
        // Upload avatar if it exists in the form data
        const avatarFile = data.get('avatar') as File | null;
        let avatarUrl: string | undefined;

        if (avatarFile && avatarFile.size > 0) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `avatars/${userId}/${fileName}`;

          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatarUrl = publicUrl;
        }

        // Prepare the update data
        const updateData: any = {};
        
        // Only include fields that are present in the form data
        const username = data.get('username')?.toString();
        const fullName = data.get('full_name')?.toString();
        const bio = data.get('bio')?.toString();
        const website = data.get('website')?.toString();

        if (username) updateData.username = username;
        if (fullName) updateData.full_name = fullName;
        if (bio) updateData.bio = bio;
        if (website) updateData.website = website;
        if (avatarUrl) updateData.avatar_url = avatarUrl;

        // Update the user profile
        const { data: profile, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        return profile;
      } else {
        // Handle non-file updates (regular object)
        const { data: profile, error } = await supabase
          .from('users')
          .update(data)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        return profile;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the user profile
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
