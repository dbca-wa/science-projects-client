/**
 * LinkButton Component
 * 
 * Button for inserting and editing links with security validation.
 * Shows a popover when clicking on existing links for quick editing.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { Link as LinkIcon, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { sanitizeUrl } from '@/shared/utils';
import type { LinkButtonProps } from '@/shared/types/editor.types';

export const LinkButton: React.FC<LinkButtonProps> = ({ disabled = false }) => {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      
      // Check if node or parent is a link
      let linkNode = null;
      if ($isLinkNode(node)) {
        linkNode = node;
      } else if (parent && $isLinkNode(parent)) {
        linkNode = parent;
      }
      
      if (linkNode) {
        setIsActive(true);
        const url = linkNode.getURL();
        setCurrentLinkUrl(url);
      } else {
        setIsActive(false);
        setCurrentLinkUrl('');
        setIsPopoverOpen(false);
      }
    }
  }, []);

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

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const handleClick = () => {
    if (isActive) {
      // If already a link, show popover for quick actions
      setIsPopoverOpen(true);
    } else {
      // Check if there's a selection
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          setLinkUrl('');
          setIsDialogOpen(true);
        } else {
          toast.error('Please select text to create a link');
        }
      });
    }
  };

  const handleEditClick = () => {
    setLinkUrl(currentLinkUrl);
    setIsPopoverOpen(false);
    setIsDialogOpen(true);
  };

  const handleVisitClick = () => {
    if (currentLinkUrl) {
      window.open(currentLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleInsertLink = () => {
    const sanitizedUrl = sanitizeUrl(linkUrl);
    
    if (!sanitizedUrl) {
      toast.error('Invalid URL. Please enter a valid URL.');
      return;
    }
    
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizedUrl);
    setIsDialogOpen(false);
    setLinkUrl('');
  };

  const handleRemoveLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setIsDialogOpen(false);
    setIsPopoverOpen(false);
    setLinkUrl('');
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 ${isActive ? 'w-auto px-2 bg-gray-200 dark:bg-gray-700' : 'w-8 p-0'}`}
            onClick={handleClick}
            disabled={disabled}
            aria-label={isActive ? 'Edit Link' : 'Insert Link'}
            title={isActive ? 'Edit Link' : 'Insert Link'}
          >
            <LinkIcon className="h-4 w-4" />
            {isActive && <span className="ml-1.5 text-xs">Edit</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Link</p>
              <a
                href={currentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {currentLinkUrl}
              </a>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVisitClick}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLink}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isActive ? 'Edit Link' : 'Insert Link'}</DialogTitle>
            <DialogDescription>
              Enter the URL for the link. Only http, https, and mailto protocols are allowed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                If no protocol is specified, https:// will be added automatically
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setLinkUrl('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsertLink}
              disabled={!linkUrl.trim()}
            >
              {isActive ? 'Update' : 'Insert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
