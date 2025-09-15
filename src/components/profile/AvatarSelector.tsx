import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AvatarSelectorProps {
  onSelect: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
}

export const AvatarSelector = ({ onSelect, currentAvatarUrl }: AvatarSelectorProps) => {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatars = async () => {
      setIsLoading(true);
      try {
        // Try both bucket names
        const bucketNames = ['Stocky Avatars', 'Avatars'];
        let allAvatarUrls: string[] = [];

        for (const bucketName of bucketNames) {
          try {
            // List files in the bucket
            const { data: files, error } = await supabase.storage
              .from(bucketName)
              .list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
              });

            if (error) {
              console.warn(`Error listing files in ${bucketName}:`, error);
              continue; // Skip to next bucket if this one fails
            }

            if (!files || files.length === 0) {
              console.warn(`No files found in ${bucketName}`);
              continue;
            }

            // Get public URLs for all files
            const avatarUrls = files
              .filter(file => file.name !== '.emptyFolderPlaceholder' && 
                             !file.name.endsWith('.DS_Store'))
              .map(file => {
                const { data: urlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(file.name);
                return urlData.publicUrl;
              });

            allAvatarUrls = [...allAvatarUrls, ...avatarUrls];
            
          } catch (err) {
            console.warn(`Error processing bucket ${bucketName}:`, err);
          }
        }

        setAvatars(allAvatarUrls);
        console.log('Fetched avatar URLs:', allAvatarUrls);
        
      } catch (error) {
        console.error('Error fetching avatars:', error);
        setAvatars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleSelectAvatar = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onSelect(avatarUrl);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
        {avatars.map((avatarUrl, index) => (
          <Button
            key={index}
            variant="outline"
            size="icon"
            className={`h-16 w-16 rounded-full p-0 transition-all ${
              selectedAvatar === avatarUrl || (!selectedAvatar && currentAvatarUrl === avatarUrl)
                ? 'ring-2 ring-primary ring-offset-2'
                : ''
            }`}
            onClick={() => handleSelectAvatar(avatarUrl)}
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        ))}
      </div>
      {selectedAvatar && (
        <div className="text-sm text-muted-foreground">
          Selected avatar will be saved when you update your profile.
        </div>
      )}
    </div>
  );
};
