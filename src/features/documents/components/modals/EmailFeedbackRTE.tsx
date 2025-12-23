import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $isElementNode } from "lexical";
import type { EditorState, LexicalEditor } from "lexical";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode } from "@lexical/rich-text";
import { useEffect, useState } from "react";
import "@/features/staff-profiles/components/Editor/staffprofileeditor.css";

interface FeedbackChangeData {
  feedbackHtml: string;
  isEmpty: boolean;
  exceedsLimit: boolean;
  charCount: number;
}

interface CharacterCountPluginProps {
  maxCharCount: number;
  onChange: (exceedsLimit: boolean) => void;
}

interface EmailFeedbackRTEProps {
  initialHtml?: string;
  maxCharCount?: number;
  onChange?: (data: FeedbackChangeData) => void;
}

// Character counter plugin
const CharacterCountPlugin = ({
  maxCharCount,
  onChange,
}: CharacterCountPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const [charCount, setCharCount] = useState(0);
  const [hasExceededLimit, setHasExceededLimit] = useState(false);

  useEffect(() => {
    // Register listener to count characters on every change
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const count = countCharacters(editor);
        setCharCount(count);
        const exceeds = count > maxCharCount;
        setHasExceededLimit(exceeds);
        onChange(exceeds);
      });
    });
  }, [editor, maxCharCount, onChange]);

  return (
    <div
      className="absolute bottom-1 right-2 text-xs"
      style={{ color: hasExceededLimit ? "#ef4444" : "#6b7280" }}
    >
      <span className="text-xs">
        {charCount}/{maxCharCount}
      </span>
    </div>
  );
};

// Function to count characters in the editor
const countCharacters = (editor: LexicalEditor): number => {
  let count = 0;

  editor.getEditorState().read(() => {
    const root = $getRoot();

    // Traverse all nodes recursively
    const countNodeChars = (node: any) => {
      if (node.getType() === "text") {
        count += node.getTextContent().length;
      }

      if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          countNodeChars(child);
        }
      }
    };

    countNodeChars(root);
  });

  return count;
};

// Determine if content is empty
const isContentEmptyAdvanced = (html: string): boolean => {
  // Check if the HTML is null, undefined, or an empty string
  if (!html) return true;

  // List of patterns that should be considered empty
  const emptyPatterns = [
    "",
    "<p></p>",
    "<p><br></p>",
    '<p class="editor-p-light"></p>',
    '<p class="editor-p-light"><br></p>',
    '<p class="editor-paragraph"></p>',
    "<div></div>",
    "<div><br></div>",
    '<div class="editor-p-light"></div>',
    '<div class="editor-p-light"><br></div>',
    "<br>",
  ];

  // Normalize the input HTML
  const normalizedHtml = html
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/[\r\n]/g, "") // Remove line breaks
    .toLowerCase();

  // Check against empty patterns
  return emptyPatterns.some(
    (pattern) => normalizedHtml === pattern.replace(/\s+/g, "").toLowerCase(),
  );
};

const generateTheme = () => {
  return {
    paragraph: "editor-p-light",
    span: "editor-p-light",
    text: {
      bold: "editor-bold-light",
      italic: "editor-italics-light",
      underline: "editor-underline-light",
      strikethrough: "editor-strikethrough-light",
      subscript: "editor-textSubscript-light",
      underlineStrikethrough: "editor-underline-strikethrough-light",
    },
    link: "editor-link",
  };
};

// Helper component to populate initial HTML content
interface OnInitialLoadPluginProps {
  html: string;
}

const OnInitialLoadPlugin = ({ html }: OnInitialLoadPluginProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html || html === "") return;

    editor.update(() => {
      // Create a temporary DOM element
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");

      // Convert DOM nodes to Lexical nodes
      const nodes = $generateNodesFromDOM(editor, dom);

      // Get the root and replace its children
      const root = $getRoot();
      root.clear();

      // Add the parsed nodes
      nodes.forEach((node) => root.append(node));
    });
  }, [html, editor]);

  return null;
};

// Email Feedback Rich Text Editor
const EmailFeedbackRTE = ({
  initialHtml = "",
  maxCharCount = 500,
  onChange = () => {},
}: EmailFeedbackRTEProps) => {
  const [exceedsLimit, setExceedsLimit] = useState(false);

  const theme = generateTheme();

  const initialConfig = {
    namespace: "EmailFeedbackEditor",
    editable: true,
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [LinkNode, AutoLinkNode, HeadingNode, ListNode, ListItemNode],
  };

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      // Generate HTML from the editor content
      const htmlContent = $generateHtmlFromNodes(editor, null);

      // Check if content is empty
      const isEmpty = isContentEmptyAdvanced(htmlContent);
      const feedbackHtml = isEmpty ? "" : htmlContent;

      // Get character count
      const count = countCharacters(editor);

      onChange({
        feedbackHtml,
        isEmpty,
        exceedsLimit: count > maxCharCount,
        charCount: count,
      });
    });
  };

  return (
    <div className="relative w-full">
      <LexicalComposer initialConfig={initialConfig}>
        <HistoryPlugin />
        <LinkPlugin />

        {initialHtml && <OnInitialLoadPlugin html={initialHtml} />}

        <OnChangePlugin onChange={handleChange} />

        <CharacterCountPlugin
          maxCharCount={maxCharCount}
          onChange={setExceedsLimit}
        />

        <RichTextPlugin
          contentEditable={
            <div className="relative min-h-[100px] rounded-md border border-gray-300 bg-white p-2.5">
              <ContentEditable
                style={{
                  height: "100%",
                  minHeight: "80px",
                  outline: "none",
                  whiteSpace: "pre-wrap",
                }}
              />
            </div>
          }
          placeholder={
            <div className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
              Add optional comments...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>

      {exceedsLimit && (
        <p className="mt-1 text-xs text-red-500">
          The feedback exceeds the maximum character limit.
        </p>
      )}
    </div>
  );
};

export default EmailFeedbackRTE;
