/**
 * DragDropPlugin
 * 
 * Enables drag and drop reordering of blocks (paragraphs, headings, list items).
 * Uses a floating drag handle that follows the mouse cursor.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getRoot,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  type LexicalEditor,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { GripVertical } from 'lucide-react';

const SPACE = 4;
const TARGET_LINE_HALF_HEIGHT = 2;
const DRAG_DATA_FORMAT = 'application/x-lexical-drag-block';

function getTopLevelNodeKeys(editor: LexicalEditor): string[] {
  return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
}

function getBlockElement(
  _anchorElem: HTMLElement,
  editor: LexicalEditor,
  event: MouseEvent,
): HTMLElement | null {
  const topLevelNodeKeys = getTopLevelNodeKeys(editor);
  let blockElem: HTMLElement | null = null;

  editor.getEditorState().read(() => {
    for (const key of topLevelNodeKeys) {
      const elem = editor.getElementByKey(key);
      if (elem === null) continue;

      const rect = elem.getBoundingClientRect();
      if (event.y >= rect.top && event.y <= rect.bottom) {
        blockElem = elem;
        break;
      }
    }
  });

  return blockElem;
}

function setMenuPosition(
  targetElem: HTMLElement | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
) {
  if (!targetElem) {
    floatingElem.style.opacity = '0';
    floatingElem.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const targetRect = targetElem.getBoundingClientRect();
  const targetStyle = window.getComputedStyle(targetElem);
  const anchorRect = anchorElem.getBoundingClientRect();
  const floatingRect = floatingElem.getBoundingClientRect();

  // Use line-height instead of element height to position on the first line
  // This is important for multi-line elements like list items
  const lineHeight = parseInt(targetStyle.lineHeight, 10);
  const top = targetRect.top - anchorRect.top + (lineHeight - floatingRect.height) / 2;
  const left = SPACE;

  floatingElem.style.opacity = '1';
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

function setTargetLine(
  targetLineElem: HTMLElement,
  targetBlockElem: HTMLElement,
  mouseY: number,
  anchorElem: HTMLElement,
) {
  const targetRect = targetBlockElem.getBoundingClientRect();
  const anchorRect = anchorElem.getBoundingClientRect();

  let lineTop = targetRect.top;
  if (mouseY >= targetRect.top + targetRect.height / 2) {
    lineTop += targetRect.height;
  }

  const top = lineTop - anchorRect.top - TARGET_LINE_HALF_HEIGHT;
  const left = 28;

  targetLineElem.style.transform = `translate(${left}px, ${top}px)`;
  targetLineElem.style.width = `${anchorRect.width - 56}px`;
  targetLineElem.style.opacity = '0.4';
}

function hideTargetLine(targetLineElem: HTMLElement | null) {
  if (targetLineElem) {
    targetLineElem.style.opacity = '0';
    targetLineElem.style.transform = 'translate(-10000px, -10000px)';
  }
}

export const DragDropPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [draggableBlockElem, setDraggableBlockElem] = useState<HTMLElement | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  // Get the parent container (which includes toolbar + editor)
  const editorRoot = editor.getRootElement();
  const anchorElem = editorRoot?.parentElement || editorRoot;

  // Track mouse movement to show/hide drag handle
  useEffect(() => {
    if (!anchorElem) return;

    const onMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't update if hovering over the menu itself
      if (target.closest('.drag-handle-menu')) {
        return;
      }

      const blockElem = getBlockElement(anchorElem, editor, event);
      setDraggableBlockElem(blockElem);
    };

    const onMouseLeave = () => {
      setDraggableBlockElem(null);
    };

    anchorElem.addEventListener('mousemove', onMouseMove);
    anchorElem.addEventListener('mouseleave', onMouseLeave);

    return () => {
      anchorElem.removeEventListener('mousemove', onMouseMove);
      anchorElem.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [anchorElem, editor]);

  // Update menu position when draggable block changes
  useEffect(() => {
    if (menuRef.current && anchorElem) {
      setMenuPosition(draggableBlockElem, menuRef.current, anchorElem);
    }
  }, [draggableBlockElem, anchorElem]);

  // Handle drag and drop commands
  useEffect(() => {
    if (!anchorElem) return;

    const onDragOver = (event: DragEvent): boolean => {
      if (!isDraggingRef.current) return false;

      const targetBlockElem = getBlockElement(anchorElem, editor, event);
      const targetLineElem = targetLineRef.current;

      if (targetBlockElem && targetLineElem) {
        setTargetLine(targetLineElem, targetBlockElem, event.pageY, anchorElem);
      }

      event.preventDefault();
      return true;
    };

    const onDrop = (event: DragEvent): boolean => {
      if (!isDraggingRef.current) return false;

      const dragData = event.dataTransfer?.getData(DRAG_DATA_FORMAT) || '';
      const draggedNode = $getNodeByKey(dragData);
      if (!draggedNode) return false;

      const targetBlockElem = getBlockElement(anchorElem, editor, event);
      if (!targetBlockElem) return false;

      const targetNode = $getNearestNodeFromDOMNode(targetBlockElem);
      if (!targetNode || targetNode === draggedNode) return true;

      const targetRect = targetBlockElem.getBoundingClientRect();
      if (event.pageY >= targetRect.top + targetRect.height / 2) {
        targetNode.insertAfter(draggedNode);
      } else {
        targetNode.insertBefore(draggedNode);
      }

      setDraggableBlockElem(null);
      return true;
    };

    return mergeRegister(
      editor.registerCommand(DRAGOVER_COMMAND, onDragOver, COMMAND_PRIORITY_LOW),
      editor.registerCommand(DROP_COMMAND, onDrop, COMMAND_PRIORITY_HIGH),
    );
  }, [anchorElem, editor]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !draggableBlockElem) return;

    let nodeKey = '';
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableBlockElem);
      if (node) {
        nodeKey = node.getKey();
      }
    });

    isDraggingRef.current = true;
    dataTransfer.setData(DRAG_DATA_FORMAT, nodeKey);
    dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    isDraggingRef.current = false;
    hideTargetLine(targetLineRef.current);
  };

  if (!anchorElem) return null;

  return createPortal(
    <>
      <div
        ref={menuRef}
        className="drag-handle-menu"
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          cursor: 'grab',
          opacity: 0,
          willChange: 'transform',
          padding: '4px',
          borderRadius: '4px',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgb(243 244 246)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <GripVertical className="w-4 h-4 text-gray-400" style={{ pointerEvents: 'none' }} />
      </div>
      <div
        ref={targetLineRef}
        style={{
          pointerEvents: 'none',
          background: 'rgb(59 130 246)',
          height: '4px',
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: 0,
          willChange: 'transform',
        }}
      />
    </>,
    anchorElem,
  );
};
