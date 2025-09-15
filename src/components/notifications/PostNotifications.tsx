import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PostNotifications = () => {
  /* const navigate = useNavigate(); */

  useEffect(() => {
    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          const newPost = payload.new as { id: string; title?: string; user_id?: string };
          
          // Skip if it's the current user's post
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id === newPost.user_id) return;

          toast.success(
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">New Post Created</span>
              <span className="text-sm">{newPost.title || 'Untitled Post'}</span>
            </div>,
            {
              duration: 5000,
              /* action: {
                label: 'View',
                onClick: () => navigate(`/posts/${newPost.id}`),
              }, */
            }
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      postsSubscription.unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PostNotifications;
