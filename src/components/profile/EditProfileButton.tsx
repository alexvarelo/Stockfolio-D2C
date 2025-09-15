import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { UserOnboardingWizard } from '@/components/onboarding/UserOnboardingWizard';
import { useAuth } from '@/lib/auth';

interface EditProfileButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EditProfileButton({ 
  className = '',
  variant = 'outline',
  size = 'default'
}: EditProfileButtonProps) {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !userProfile) return null;

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
      
      <UserOnboardingWizard
        open={isOpen}
        onComplete={() => setIsOpen(false)}
        userId={user.id}
        email={user.email || ''}
        isEditMode={true}
        initialData={{
          username: userProfile.email?.split('@')[0] || '',
          full_name: userProfile.full_name || '',
          bio: '',
          avatar_url: userProfile.avatar_url || ''
        }}
      />
    </>
  );
}
