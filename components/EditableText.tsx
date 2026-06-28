import React, { useState, useEffect, useRef, useContext } from 'react';
import { WebsiteBuilderContext } from './WebsiteBuilderContext';

interface EditableTextProps {
  id: string;
  defaultText: string;
  isEditMode?: boolean;
  className?: string;
  tagName?: any;
  onUpdate?: (id: string, newText: string) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  id,
  defaultText,
  className = '',
  tagName: Tag = 'span',
  onUpdate
}) => {
  const context = useContext(WebsiteBuilderContext);
  const isEditMode = context?.isEditMode || false;
  const elementRef = useRef<HTMLElement>(null);

  // Synchronize with context to support Undo/Redo visually, and defaultText for language changes
  const stored = JSON.parse(localStorage.getItem('cot_website_builder_texts') || '{}');
  const contextText = context?.pendingTextChanges?.[id];
  const publishedText = stored[id];
  const displayText = contextText !== undefined ? contextText : (publishedText !== undefined ? publishedText : defaultText);

  const handleBlur = () => {
    if (elementRef.current) {
      const newText = elementRef.current.innerText.trim();
      if (context && context.updateText && newText !== displayText) {
        context.updateText(id, newText);
      }
      if (onUpdate && newText !== displayText) {
        onUpdate(id, newText);
      }
    }
  };

  if (isEditMode) {
    return (
      <Tag
        ref={elementRef as any}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        className={`${className} border border-dashed border-transparent hover:border-blue-400 focus:border-blue-500 outline-none cursor-text transition-colors`}
      >
        {displayText}
      </Tag>
    );
  }

  return <Tag className={className}>{displayText}</Tag>;
};
