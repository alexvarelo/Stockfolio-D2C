import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
// Import components with aliases to avoid naming conflicts
import { UserPosts as UserPostsComponent } from '@/components/profile/UserPosts';
import { UserPortfolios as UserPortfoliosComponent } from '@/components/profile/UserPortfolios';
import { useAuth } from '@/lib/auth';
import { useUserProfile, useFollowUser, useUnfollowUser, useUserFollowers, useUserFollowing, useIsFollowing, useUserPostCount } from '@/api/user/user';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bookmark, Briefcase, Loader2, User } from 'lucide-react';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';


interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  website?: string;
  created_at: string;
  is_public: boolean;
  is_verified: boolean;
  updated_at: string;
  email: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  value: number;
  return: number;
  isPublic: boolean;
}

interface TabContentProps {
  userId: string;
}

interface SavedPostsProps extends TabContentProps {
  isOwnProfile: boolean;
}

interface UserPostsProps extends TabContentProps {}

interface UserPortfoliosProps extends TabContentProps {}

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('posts');
  
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch: refetchProfile
  } = useUserProfile(userId || '');
  
  const isOwnProfile = useMemo(() => user?.id === profile?.id, [user?.id, profile?.id]);
  
  // Follow/Unfollow functionality using custom hooks
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  
  // Check if current user is following this profile using custom hook
  const { 
    data: isFollowing = false, 
    isLoading: isCheckingFollowing 
  } = useIsFollowing(user?.id, userId);

  // Get followers, following, and post counts using custom hooks
  const { data: followers = [] } = useUserFollowers(userId || '');
  const { data: following = [] } = useUserFollowing(userId || '');
  const { data: postCount = 0 } = useUserPostCount(userId);

  // Follow/Unfollow button with animation
  const FollowButton = () => {
    const handleFollowClick = async () => {
      if (!userId) return;
      
      try {
        if (isFollowing) {
          await unfollowUser.mutateAsync(userId);
        } else {
          await followUser.mutateAsync(userId);
        }
      } catch (error) {
        console.error('Error updating follow status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update follow status. Please try again.',
          variant: 'destructive',
        });
      }
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          size="sm"
          onClick={handleFollowClick}
          disabled={isCheckingFollowing || followUser.isPending || unfollowUser.isPending}
          className="w-full sm:w-auto"
        >
          {isCheckingFollowing || followUser.isPending || unfollowUser.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            'Following'
          ) : (
            'Follow'
          )}
        </Button>
      </motion.div>
    );
  };
  
  const handleFollow = async () => {
    if (!user?.id || !profile?.id) return;
    
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(profile.id);
        toast({
          title: "Success",
          description: `You've unfollowed ${profile.full_name || profile.username}`,
        });
      } else {
        await followUser.mutateAsync(profile.id);
        toast({
          title: "Success",
          description: `You're now following ${profile.full_name || profile.username}`,
        });
      }
      
      // Refresh the profile data
      refetchProfile();
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading profile</h2>
          <p className="mb-4">We couldn't load the profile. Please try again later.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchProfile()}
            disabled={isLoading}
          >
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-muted-foreground mt-2">The user you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // Animation variants with proper typing
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10
      }
    }
  } as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8 w-full"
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Profile Header - Redesigned Layout */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Left Section - Avatar and User Info */}
          <div className="flex flex-col md:flex-row items-start gap-6 w-full md:w-1/2">
            {/* Avatar */}
            <motion.div variants={item} className="flex-shrink-0">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-border">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="text-2xl sm:text-4xl">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* User Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">{profile.username}</h1>
                {!isOwnProfile && <FollowButton />}
              </div>
              
              {profile.full_name && (
                <motion.h2 variants={item} className="">
                  {profile.full_name}
                </motion.h2>
              )}
              
              {profile.bio && (
                <motion.p 
                  variants={item}
                  className="text-muted-foreground/90 leading-relaxed whitespace-pre-line"
                >
                  {profile.bio}
                </motion.p>
              )}
              
              {profile.website && (
                <motion.a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm block"
                  variants={item}
                >
                  {profile.website.replace(/(https?:\/\/)?(www\.)?/i, '')}
                </motion.a>
              )}
            </div>
          </div>

          {/* Right Section - Stats */}
          <div className="md:pl-8 w-full md:w-1/2">
            <motion.div 
              variants={item}
              className="flex justify-around md:justify-start md:gap-12 h-full items-center"
            >
              <button 
                onClick={() => navigate(`/user/${profile.id}/posts`)}
                className="flex flex-col items-center group flex-1"
              >
                <span className="text-2xl font-bold">{postCount}</span>
                <span className="text-sm text-muted-foreground">Posts</span>
              </button>
              
              <button 
                onClick={() => navigate(`/user/${profile.id}/followers`)}
                className="flex flex-col items-center group flex-1"
              >
                <span className="text-2xl font-bold">{followers.length}</span>
                <span className="text-sm text-muted-foreground">Followers</span>
              </button>
              
              <button 
                onClick={() => navigate(`/user/${profile.id}/following`)}
                className="flex flex-col items-center group flex-1"
              >
                <span className="text-2xl font-bold">{following.length}</span>
                <span className="text-sm text-muted-foreground">Following</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Join Date */}
        <motion.div 
          variants={item}
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground/80"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item} className="mt-8">
          <Tabs 
            defaultValue="posts" 
            onValueChange={setActiveTab}
            value={activeTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="posts" 
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="portfolios" 
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Portfolios
              </TabsTrigger>
              {isOwnProfile && (
                <>
                  <TabsTrigger 
                    value="saved" 
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Saved
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calendar" 
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="posts" className="mt-6">
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserPostsComponent userId={profile.id} />
                </motion.div>
              </TabsContent>
              
              {isOwnProfile && (
                <TabsContent value="calendar" className="mt-6">
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActivityCalendar />
                  </motion.div>
                </TabsContent>
              )}

              <TabsContent value="portfolios" className="mt-6">
                <motion.div
                  key="portfolios"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserPortfoliosComponent userId={profile.id} />
                </motion.div>
              </TabsContent>

              <TabsContent value="saved" className="mt-6">
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center py-8">
                    <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">Saved posts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posts you save will appear here
                    </p>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Skeleton loader for the user profile
const UserProfileSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
  >
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto" />
            </div>
      
      <div className="flex justify-center gap-8 py-4">
        <Skeleton className="h-12 w-20" />
        <Skeleton className="h-12 w-20" />
        <Skeleton className="h-12 w-20" />
        </div>
      
      <Skeleton className="h-20 w-full" />
      
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </motion.div>
);


export default UserProfile;
