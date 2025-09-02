import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { UserProfile, UserFollow } from "@/types/user";

// Get user profile by ID
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Fetching user profile for ID:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        console.log('No user found with ID:', userId);
        return null;
      }

      console.log('Fetched user profile:', data);
      console.log('User profile keys:', Object.keys(data));
      return data;
    },
    enabled: !!userId,
  });
};

// Follow a user
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_follows")
        .insert([
          {
            follower_id: user.id,
            following_id: followingId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (followingId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["is-following", user?.id, followingId] });
      
      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(["is-following", user?.id, followingId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["is-following", user?.id, followingId], true);
      
      // Return a context with the previous and new value
      return { previousStatus };
    },
    onError: (err, followingId, context) => {
      // Rollback on error
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(["is-following", user?.id, followingId], context.previousStatus);
      }
    },
    onSettled: (data, error, followingId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["is-following", user?.id, followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-followers", followingId],
      });
      queryClient.invalidateQueries({ 
        queryKey: ["user-following", user?.id] 
      });
    },
  });
};

// Unfollow a user
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (error) throw error;
    },
    onMutate: async (followingId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["is-following", user?.id, followingId] });
      
      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(["is-following", user?.id, followingId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["is-following", user?.id, followingId], false);
      
      // Return a context with the previous and new value
      return { previousStatus };
    },
    onError: (err, followingId, context) => {
      // Rollback on error
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(["is-following", user?.id, followingId], context.previousStatus);
      }
    },
    onSettled: (data, error, followingId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["is-following", user?.id, followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-followers", followingId],
      });
      queryClient.invalidateQueries({ 
        queryKey: ["user-following", user?.id] 
      });
    },
  });
};

// Check if a user is following another user
export const useIsFollowing = (followerId: string | undefined, followingId: string | undefined) => {
  return useQuery<boolean>({
    queryKey: ["is-following", followerId, followingId],
    queryFn: async () => {
      if (!followerId || !followingId) return false;
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();

      if (error) {
        console.error("Error checking follow status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!followerId && !!followingId,
  });
};

// Get user's followers
export const useUserFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["user-followers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select("follower:users!follower_id(*)")
        .eq("following_id", userId);

      if (error) throw error;
      // Map the database response to match UserProfile type
     return data;
    },
    enabled: !!userId,
  });
};

// Type for the basic user info we need for the following list
type BasicUserInfo = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

// Get who a user is following
export const useUserFollowing = (userId: string) => {
  return useQuery<BasicUserInfo[]>({
    queryKey: ["user-following", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get the list of followed user IDs
      const { data: follows, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (error || !follows?.length) return [];
      
      // Get user details from the users table (not profiles)
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, avatar_url")
        .in("id", follows.map(f => f.following_id));
        
      if (usersError) throw usersError;
      return users || [];
    },
    enabled: !!userId,
  });
};

// Get user's post count
export const useUserPostCount = (userId: string | undefined) => {
  return useQuery<number>({
    queryKey: ["user-post-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { count, error } = await supabase
        .from("posts")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
};
