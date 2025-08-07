import { Link } from 'react-router-dom';

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
  currentPath: string;
  className?: string;
}

export const NavLinks = ({ links, currentPath, className = '' }: NavLinksProps) => {
  return (
    <>
      {links.map((link) => {
        const isActive = link.href === '/' 
          ? currentPath === link.href
          : currentPath.startsWith(link.href);

        return (
          <Link
            key={link.href}
            to={link.href}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            } ${className}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
};
