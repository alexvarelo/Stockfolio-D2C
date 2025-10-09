import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Search,
  UserPlus,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

type UserProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string | null;
  email: string | null;
};

export default function DiscoverPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Fetch all users except the current user
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["discover-users", debouncedSearchQuery],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all users except the current one
      let query = supabase.from("users").select("*").neq("id", user.id);

      if (debouncedSearchQuery.trim()) {
        const search = debouncedSearchQuery.toLowerCase();
        query = query.or(
          `username.ilike.%${search}%,full_name.ilike.%${search}%`
        );
      }

      const { data: usersData, error } = await query;
      if (error) throw error;

      return (usersData || []) as UserProfile[];
    },
    enabled: !!user?.id,
  });

  // Fetch following status for the current user
  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!user?.id) return;

      try {
        const { data: followingData, error } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (error) throw error;

        const newFollowingMap = (followingData || []).reduce<
          Record<string, boolean>
        >(
          (acc, { following_id }) => ({
            ...acc,
            [following_id]: true,
          }),
          {}
        );

        setFollowingMap(newFollowingMap);
      } catch (error) {
        console.error("Error fetching following status:", error);
      }
    };

    fetchFollowingStatus();
  }, [user?.id, users]);

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    if (!user?.id) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;

        // Update local state optimistically
        setFollowingMap((prev) => ({
          ...prev,
          [userId]: false,
        }));

        toast.success("Successfully unfollowed user");
      } else {
        // Follow
        const { error } = await supabase.from("user_follows").insert([
          {
            follower_id: user.id,
            following_id: userId,
          },
        ]);

        if (error) throw error;

        // Update local state optimistically
        setFollowingMap((prev) => ({
          ...prev,
          [userId]: true,
        }));

        toast.success("Successfully followed user");
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["discover-users"] });
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground">
          Find and connect with other investors in the community
        </p>
      </div>

      <div className="space-y-6">

        <div className="max-w-md">
          <form onSubmit={(e) => e.preventDefault()} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or username..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((userProfile) => (
            <Card
              key={userProfile.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Link
                    to={`/user/${userProfile.id}`}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-12 w-12 hover:opacity-90 transition-opacity">
                      <AvatarImage
                        src={userProfile.avatar_url || ""}
                        alt={userProfile.full_name || "User"}
                      />
                      <AvatarFallback>
                        {userProfile.full_name
                          ? userProfile.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link
                    to={`/user/${userProfile.id}`}
                    className="flex-1 min-w-0 hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate hover:underline">
                        {userProfile.full_name || "User"}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      @{userProfile.username || "user"}
                    </p>
                    {userProfile.bio && (
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                        {userProfile.bio}
                      </p>
                    )}
                  </Link>
                  <Button
                    variant={
                      followingMap[userProfile.id] ? "outline" : "default"
                    }
                    size="sm"
                    className="ml-auto"
                    onClick={() =>
                      handleFollowToggle(
                        userProfile.id,
                        !!followingMap[userProfile.id]
                      )
                    }
                  >
                    {followingMap[userProfile.id] ? (
                      <UserCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {followingMap[userProfile.id] ? "Following" : "Follow"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No users found matching your search."
                : "No public users found."}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
