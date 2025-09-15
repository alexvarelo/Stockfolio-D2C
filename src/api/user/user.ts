import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { UserProfile, UserFollow } from "@/types/user";

// Get user profile by ID or username
export const useUserProfile = (identifier: string) => {
  return useQuery({
    queryKey: ['user-profile', identifier],
    queryFn: async () => {
      if (!identifier) {
        throw new Error('User identifier is required');
      }

      console.log('Fetching user profile for identifier:', identifier);
      
      // Check if the identifier is a UUID (user ID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      
      let query = supabase
        .from('users')
        .select('*');
      
      if (isUuid) {
        query = query.eq('id', identifier);
      } else {
        query = query.ilike('username', identifier);
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        console.log('No user found with identifier:', identifier);
        return null;
      }

      console.log('Fetched user profile:', data);
      console.log('User profile keys:', Object.keys(data));
      return data;
    },
    enabled: !!identifier,
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
      
      // If followingId is a username, we need to look up the user ID first
      let targetUserId = followingId;
      
      // Check if followingId is a username (not a UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(followingId);
      
      if (!isUuid) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .ilike('username', followingId)
          .single();
          
        if (userError || !userData) {
          console.error('Error finding user:', userError);
          return false;
        }
        
        targetUserId = userData.id;
      }
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", targetUserId)
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
export const useUserFollowers = (identifier: string) => {
  return useQuery<BasicUserInfo[]>({
    queryKey: ["user-followers", identifier],
    queryFn: async () => {
      if (!identifier) return [];
      
      // Check if identifier is a username
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      let userId = identifier;
      
      if (!isUuid) {
        // Look up user ID by username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .ilike('username', identifier)
          .single();
          
        if (userError || !userData) {
          console.error('Error finding user:', userError);
          return [];
        }
        
        userId = userData.id;
      }
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("follower:profiles!user_follows_follower_id_fkey(id, username, full_name, avatar_url)")
        .eq("following_id", userId);

      if (error) {
        console.error("Error fetching followers:", error);
        return [];
      }

      return data.map((f: any) => f.follower).filter(Boolean);
    },
    enabled: !!identifier,
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
export const useUserFollowing = (identifier: string) => {
  return useQuery<BasicUserInfo[]>({
    queryKey: ["user-following", identifier],
    queryFn: async () => {
      if (!identifier) return [];
      
      // Check if identifier is a username
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      let userId = identifier;
      
      if (!isUuid) {
        // Look up user ID by username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .ilike('username', identifier)
          .single();
          
        if (userError || !userData) {
          console.error('Error finding user:', userError);
          return [];
        }
        
        userId = userData.id;
      }
      
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
    enabled: !!identifier,
  });
};

// Get user's post count
export const useUserPostCount = (identifier: string | undefined) => {
  return useQuery<number>({
    queryKey: ["user-post-count", identifier],
    queryFn: async () => {
      if (!identifier) return 0;
      
      // Check if identifier is a username
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      let userId = identifier;
      
      if (!isUuid) {
        // Look up user ID by username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .ilike('username', identifier)
          .single();
          
        if (userError || !userData) {
          console.error('Error finding user:', userError);
          return 0;
        }
        
        userId = userData.id;
      }
      
      const { count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching post count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!identifier,
  });
};
