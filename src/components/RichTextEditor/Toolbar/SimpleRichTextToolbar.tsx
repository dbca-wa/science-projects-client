// Toolbar for the simple rich text editor

import {
  Divider,
  Flex,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { RefObject, SetStateAction, useEffect, useState } from "react";
import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener";
import { TimeButtons } from "./TimeButtons";
import { BoldButton } from "../Buttons/BoldButton";
import { VerticalDivider } from "./VerticalDivider";
import { ItalicsButton } from "../Buttons/ItalicsButton";
import { UnderlineButton } from "../Buttons/UnderlineButton";
import { SimpleFontFormatterButton } from "../MenuButtons/SimpleFontFormatterButton";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { InsertItemMenuButton } from "../MenuButtons/InsertItemMenuButton";
import { ElementTypeButton } from "../MenuButtons/ElementTypeButton";

interface Props {
  allowInsertButton: boolean;
  editorRef: RefObject<HTMLTextAreaElement>;
  selectedNodeType: string;
  setSelectedNodeType: React.Dispatch<SetStateAction<string>>;
}

export const SimpleRichTextToolbar = ({
  allowInsertButton,
  editorRef,
  selectedNodeType,
  setSelectedNodeType,
}: Props) => {
  const { onClick } = useToolbarClickListener({
    currentlySelectedNode: selectedNodeType,
    editorRef: editorRef,
  });

  useEffect(() => {
    console.log(selectedNodeType);
  }, [selectedNodeType]);
  const shouldShowToolbarToggleBtnWhenNotSmall = useBreakpointValue({
    base: true,
    xl: false,
  });
  const isSmall = useBreakpointValue({
    base: true,
    sm: true,
    md: true,
    lg: false,
  });
  const [currentToolbarPage, setCurrentToolbarPage] = useState<number>(1);
  const [currentToolbarPageMd, setCurrentToolbarPageMd] = useState<number>(1);
  const { colorMode } = useColorMode();

  useEffect(() => console.log(colorMode), [colorMode]);
  const [editor] = useLexicalComposerContext();

  return (
    <>
      {/* <AutoFocusPlugin clickFunction={onClick} /> */}
      <Flex
        width={"100%"}
        // mt={2}
        p={2}
        borderRadius={"20px 20px 0 0"}
        backgroundColor={
          colorMode === "light" ? "whiteAlpha.800" : "blackAlpha.400"
        }
        // backgroundColor={"gray.200"}
        overflowX={
          "hidden"
          // shouldShowEllipsis ?
          // 'auto'
          // : 'hidden'
        }
        justifyContent={"space-between"}
        display={"flex"}
        zIndex={2}
      >
        <>
          <TimeButtons onClick={onClick} editor={editor} />
          <VerticalDivider />
          <BoldButton onClick={onClick} editor={editor} />
          <ItalicsButton onClick={onClick} editor={editor} />
          <UnderlineButton onClick={onClick} editor={editor} />
          <VerticalDivider />
          {allowInsertButton ? (
            <>
              <ElementTypeButton
                onClick={onClick}
                selectedNodeType={selectedNodeType}
                editor={editor}
                isSmall
                shouldFurtherConcat={true}

                // currentlyClickedNode={selectedNodeType}
                // setCurrentlyClickedNode={setSelectedNodeType}
              />
              <InsertItemMenuButton onClick={onClick} />
              <VerticalDivider />
            </>
          ) : null}

          <SimpleFontFormatterButton editor={editor} />
        </>
      </Flex>
      <Divider />
    </>
  );
};
