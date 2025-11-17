import { useEffect } from "react";
import { KEY_DOWN_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface SaveOnCtrlSPluginProps {
  formId?: string; // Optional prop to specify a form by ID
}

function SaveOnCtrlSPlugin({ formId }: SaveOnCtrlSPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "s") {
          event.preventDefault();

          let form: HTMLFormElement | null = null;

          if (formId) {
            form = document.getElementById(formId) as HTMLFormElement;
          } else {
            // Find the nearest form in the DOM hierarchy
            const editorElement = editor.getRootElement();
            if (editorElement) {
              form = editorElement.closest("form");
            }
          }

          if (form) {
            form.requestSubmit(); // Triggers form submission, compatible with react-hook-form
          } else {
            console.warn("No form found to submit");
          }

          return true;
        }
        return false;
      },
      0, // Low priority
    );

    return () => removeListener();
  }, [editor, formId]);

  return null;
}

export default SaveOnCtrlSPlugin;
