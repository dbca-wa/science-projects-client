// A dropdown Menu Button, that contains insert options for:
// Horizontal Rule, Image, GIF, Excalidraw, Table, Table (experimental),
// Poll, Equation, Sticky Note, Collapsible Container, Tweet, Youtube Video,
// Figma Document. Most are disabled depending on the editor type

import { InsertTableModal } from "@/shared/components/Modals/RTEModals/InsertTableModal";
import { useDisclosure } from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { AiOutlinePlus } from "react-icons/ai";
import { BsTable } from "react-icons/bs";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

interface Props {
  onClick: (event: string) => void;
}
export const InsertItemMenuButton = ({ onClick }: Props) => {
  const {
    isOpen: isAddTableOpen,
    onClose: onAddTableClose,
    onOpen: onAddTableOpen,
  } = useDisclosure();
  const TableFunc = () => {
    console.log("Table");
    // onClick('insertTable');
    onAddTableOpen();
  };

  const BulletListFunc = () => {
    console.log("BulletListFunc");

    onClick("ul");
    // onAddTableOpen();
  };

  const NumberListFunc = () => {
    console.log("NumberListFunc");
    onClick("ol");
    // onAddTableOpen();
  };

  const [editor] = useLexicalComposerContext();
  return (
    <>
      <InsertTableModal
        isOpen={isAddTableOpen}
        activeEditor={editor}
        onClose={onAddTableClose}
      />
      <BaseToolbarMenuButton
        title="Insert"
        menuIcon={AiOutlinePlus}
        menuItems={[
          {
            leftIcon: MdFormatListBulleted,
            text: "Bullet List",
            onClick: BulletListFunc,
          },
          {
            leftIcon: MdFormatListNumbered,
            text: "Numbered List",
            onClick: NumberListFunc,
          },
          {
            leftIcon: BsTable,
            text: "Table",
            onClick: TableFunc,
          },
        ]}
      />
    </>
  );
};
