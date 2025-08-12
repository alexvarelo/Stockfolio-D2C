'use client';

import { useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFormat = (format: string) => {
    const textarea = editorRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = `${value.substring(0, start)}**${selectedText}**${value.substring(end)}`;
        newCursorPos = end + 4; // Account for the added ** **
        break;
      case 'italic':
        newText = `${value.substring(0, start)}_${selectedText}_${value.substring(end)}`;
        newCursorPos = end + 2; // Account for the added _ _
        break;
      case 'h1':
        newText = `${value.substring(0, start)}# ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2; // Account for the added # 
        break;
      case 'h2':
        newText = `${value.substring(0, start)}## ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 3; // Account for the added ## 
        break;
      case 'ul':
        newText = `${value.substring(0, start)}- ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2; // Account for the added - 
        break;
      case 'ol':
        newText = `${value.substring(0, start)}1. ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 3; // Account for the added 1. 
        break;
      case 'quote':
        newText = `${value.substring(0, start)}> ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2; // Account for the added > 
        break;
      case 'link':
        newText = `${value.substring(0, start)}[${selectedText}](url)${value.substring(end)}`;
        newCursorPos = end + 3; // Place cursor between the () for URL
        break;
    }

    onChange(newText);
    // Set cursor position after state update
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div 
      className={cn('relative', className)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <style>{customStyles}</style>
      <div className="mb-2">
        <ToggleGroup type="multiple" variant="outline" size="sm">
          <ToggleGroupItem value="bold" onClick={() => handleFormat('bold')} aria-label="Bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" onClick={() => handleFormat('italic')} aria-label="Italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h1" onClick={() => handleFormat('h1')} aria-label="Heading 1">
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h2" onClick={() => handleFormat('h2')} aria-label="Heading 2">
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="ul" onClick={() => handleFormat('ul')} aria-label="Bullet List">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="ol" onClick={() => handleFormat('ol')} aria-label="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="quote" onClick={() => handleFormat('quote')} aria-label="Quote">
            <Quote className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="link" onClick={() => handleFormat('link')} aria-label="Link">
            <Link className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div ref={editorRef} className="w-full">
        <MDEditor
          value={value}
          onChange={onChange}
          preview={isFocused ? 'live' : 'preview'}
          hideToolbar={true}
          className={cn(
            'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
            'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          style={{
            minHeight: `${minHeight}px`,
          }}
          textareaProps={{
            placeholder,
            className: 'min-h-[100px]',
            autoFocus,
          }}
        />
      </div>
    </div>
  );
};
