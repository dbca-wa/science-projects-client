/**
 * FormatButton Component
 * 
 * Individual format button for bold, italic, underline.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { FormatButtonProps } from '@/shared/types/editor.types';

const formatIcons = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
};

const formatLabels = {
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
};

export const FormatButton: React.FC<FormatButtonProps> = ({ format, disabled = false }) => {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  const Icon = formatIcons[format];

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsActive(selection.hasFormat(format));
    }
  }, [format]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  const handleClick = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${isActive ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={formatLabels[format]}
      title={formatLabels[format]}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};
