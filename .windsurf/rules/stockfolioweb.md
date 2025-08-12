---
trigger: always_on
---

# Stockfolio Development Guidelines

## Component Architecture Principles

### 1. Component Decomposition
- **Single Responsibility**: Each component should have one primary responsibility
- **Small & Focused**: Keep components small and focused on a single feature
- **Reusability**: Create reusable UI components that can be used across the application
- **Composition**: Favor composition over inheritance when building complex UIs

### 2. File Structure
```
src/
  components/           # Shared UI components
    ui/                 # Basic UI elements (buttons, inputs, etc.)
    layout/             # Layout components (headers, footers, etc.)
    navigation/         # Navigation-related components
    forms/              # Form components and validation
    data-display/       # Components for displaying data (tables, lists, etc.)
    feedback/           # Feedback components (alerts, toasts, loaders)
    
  pages/                # Page-level components
  hooks/                # Custom React hooks
  utils/                # Utility functions
  lib/                  # Library code and configurations
  api/                  # API-related code and types
  styles/               # Global styles and themes
```

### 3. Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Props**: camelCase, with clear, descriptive names
- **Types/Interfaces**: PascalCase with `I` prefix (optional) or `Type` suffix

### 4. Props and Types
- Always define prop types using TypeScript interfaces
- Use `React.FC<Props>` for functional components
- Document complex props with JSDoc comments
- Destructure props at the top of the component

### 5. Styling
- Use Tailwind CSS for styling
- Keep styles co-located with components
- Use `@apply` for repeated utility combinations
- Create design tokens for colors, spacing, and typography

### 6. State Management
- Use React Query for server state
- Use Context API for global UI state
- Use `useState` for local component state
- Keep state as local as possible

### 7. Performance
- Memoize expensive calculations with `useMemo`
- Use `useCallback` for event handlers passed to child components
- Implement code splitting for routes
- Use `React.memo` for expensive renders

### 8. Testing
- Write unit tests for utility functions
- Write integration tests for complex components
- Use React Testing Library for component tests
- Test user interactions, not implementation details

### 9. Documentation
- Document component props with JSDoc
- Include usage examples in storybook
- Document complex business logic
- Keep READMEs up to date

### 10. Code Quality
- Use ESLint and Prettier
- Follow TypeScript strict mode
- Keep components small and focused
- Write self-documenting code with clear variable names

## Component Creation Checklist

Before creating a new component, ask:
1. Is this component doing too much? Can it be split?
2. Can any part of this be reused elsewhere?
3. Are the props well-typed and documented?
4. Is the component properly tested?
5. Is the code readable and maintainable?

## When to Create a New Component

Create a new component when:
- The same UI pattern is used in multiple places
- The component has a clear, single responsibility
- The component manages its own state and behavior
- The component is complex enough to benefit from isolation

## Example Component Structure

```tsx
import React from 'react';
import { SomeType } from '../types';

interface ComponentNameProps {
  /** Description of the prop */
  someProp: string;
  /** Optional prop with default */
  optionalProp?: number;
  /** Event handler */
  onClick?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  someProp,
  optionalProp = 0,
  onClick,
}) => {
  // State and hooks
  const [state, setState] = React.useState(initialState);
  
  // Handlers
  const handleClick = () => {
    // Handle click
    onClick?.();
  };

  // Render
  return (
    <div className="component-class">
      {/* Component JSX */}
    </div>
  );
};
```

## Best Practices

1. **Keep components small and focused**
2. **Use TypeScript effectively**
3. **Follow the DRY principle**
4. **Write tests**
5. **Document your components**
6. **Optimize for performance**
7. **Follow accessibility best practices**
8. **Keep up with React best practices**

## Code Review Guidelines

1. **Readability**: Is the code easy to understand?
2. **Maintainability**: Will this be easy to modify in the future?
3. **Performance**: Are there any obvious performance issues?
4. **Security**: Are there any security concerns?
5. **Testing**: Are there sufficient tests?
6. **Documentation**: Is the code well-documented?
