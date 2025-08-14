'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Custom CSS to override default MDEditor styles
const customStyles = `
  .w-md-editor {
    --md-editor-font-family: var(--font-sans);
    --md-editor-font-size: 0.875rem;
    --md-editor-bg-color: transparent;
    --md-editor-text-color: inherit;
    box-shadow: none !important;
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
  }
  
  .w-md-editor-toolbar {
    background-color: transparent !important;
    border-bottom: 1px solid hsl(var(--border)) !important;
    padding: 0.25rem 0.5rem !important;
  }
  
  .w-md-editor-content {
    background-color: transparent !important;
  }
  
  .w-md-editor-preview {
    background-color: transparent !important;
    padding: 1rem !important;
  }
  
  .wmde-markdown {
    background-color: transparent !important;
    color: inherit !important;
  }
  
  .w-md-editor-text {
    padding: 1rem !important;
  }
  
  .w-md-editor-text-pre > code,
  .w-md-editor-text-input {
    font-family: var(--font-sans) !important;
    color: inherit !important;
  }
`;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  minHeight?: number;
  autoFocus?: boolean;
}

export const MarkdownEditor = ({
  value,
  onChange,
  className,
  placeholder = 'Write your post here...',
  minHeight = 120,
  autoFocus = false,
}: MarkdownEditorProps) => {
  const [isFocused, setIsFocused] = useState(autoFocus);

  return (
    <div className={cn('relative', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={{
          minHeight: `${minHeight}px`,
        }}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};
