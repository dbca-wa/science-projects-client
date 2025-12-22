// A button to control whether the editor should be populated with previous data if it exists

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PASTE_COMMAND } from "lexical";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { BaseOptionsButton } from "./BaseOptionsButton";
import { RTEPriorReportPopulationModal } from "@/features/reports/components/modals/RTEPriorReportPopulationModal";
import { useState } from "react";

interface Props {
  canPopulate: boolean;
  // editorText: string;
  writeable_document_kind: string;
  section: string;
  project_pk: number;
}

export const PopulationButton = ({
  canPopulate,
  // editorText,
  writeable_document_kind,
  section,
  project_pk,
}: Props) => {
  const [editor] = useLexicalComposerContext();
  const copyToClipboard = (text) => {
    // Create a temporary textarea element
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);

    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    // Execute the copy command
    try {
      document.execCommand("copy");
      // console.log('Copied text:', text);
    } catch (err) {
      console.error("Failed to copy text", err);
    }

    // Remove the textarea element
    document.body.removeChild(textarea);
  };

  const populateWithLastData = (dataToPaste: string) => {
    console.log("PASTING");
    const text = dataToPaste;
    copyToClipboard(text);

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });
    pasteEvent.clipboardData.setData("text/html", text);
    editor.focus();
    editor.dispatchCommand(PASTE_COMMAND, pasteEvent);
  };

  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <RTEPriorReportPopulationModal
        isOpen={isOpen}
        onClose={onClose}
        functionToRun={populateWithLastData}
        writeable_document_kind={writeable_document_kind}
        section={section}
        project_pk={project_pk}
      />
      <BaseOptionsButton
        canRunFunction={canPopulate}
        icon={VscGitPullRequestGoToChanges}
        colorScheme={"blue"}
        onClick={onOpen}
        toolTipText="Populate"
      />
    </>
  );
};
