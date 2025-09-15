import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
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
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleEditClick = () => {
    navigate('/accounts/edit');
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleEditClick}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Edit Profile
    </Button>
  );
}
