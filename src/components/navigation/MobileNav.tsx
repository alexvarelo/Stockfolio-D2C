import { useEffect } from 'react';
import { NavLinks } from './NavLinks';

interface MobileNavProps {
  isOpen: boolean;
  links: Array<{ href: string; label: string }>;
  currentPath: string;
  onClose: () => void;
}

export const MobileNav = ({ isOpen, links, currentPath, onClose }: MobileNavProps) => {
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-menu-container')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden mobile-menu-container">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-14 right-0 w-64 h-[calc(100vh-3.5rem)] bg-background border-l z-50 overflow-y-auto">
        <div className="p-4 space-y-2">
          <nav className="flex flex-col space-y-1 pt-2">
            <NavLinks 
              links={links} 
              currentPath={currentPath} 
              className="w-full text-left px-4 py-2"
            />
          </nav>
        </div>
      </div>
    </div>
  );
};
