// Toolbar for the simple rich text editor

import { Box, Divider, Flex, useBreakpointValue, useColorMode } from "@chakra-ui/react"
import { AlignButton } from "../MenuButtons/AlignButton"
import { RefObject, SetStateAction, useEffect, useState } from "react"
import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener"
import { TimeButtons } from "./TimeButtons";
import { ElementTypeButton } from "../MenuButtons/ElementTypeButton";
import { BoldButton } from "../Buttons/BoldButton";
import { VerticalDivider } from "./VerticalDivider";
import { InsertButton } from "../MenuButtons/InsertButton";
import { ItalicsButton } from "../Buttons/ItalicsButton";
import { UnderlineButton } from "../Buttons/UnderlineButton";
import { FontFormatterButton } from "../MenuButtons/FontFormatterButton";
import { ToolbarToggleBtn } from "../Buttons/ToolbarToggleBtn";
import { SimpleFontFormatterButton } from "../MenuButtons/SimpleFontFormatterButton";


interface Props {
    editorRef: RefObject<HTMLTextAreaElement>;
    selectedNodeType: string;
    setSelectedNodeType: React.Dispatch<SetStateAction<string>>;
}

export const SimpleRichTextToolbar = ({ editorRef, selectedNodeType, setSelectedNodeType }: Props) => {

    const { onClick } = useToolbarClickListener({ currentlySelectedNode: selectedNodeType, editorRef: editorRef });

    useEffect(() => {
        console.log(selectedNodeType)
    }, [selectedNodeType]

    )
    const shouldShowToolbarToggleBtnWhenNotSmall = useBreakpointValue(
        {
            base: true,
            xl: false,
        }
    );
    const isSmall = useBreakpointValue(
        {
            base: true,
            sm: true,
            md: true,
            lg: false,
        }
    )
    const [currentToolbarPage, setCurrentToolbarPage] = useState<number>(1);
    const [currentToolbarPageMd, setCurrentToolbarPageMd] = useState<number>(1);
    const { colorMode } = useColorMode();

    useEffect(() => console.log(colorMode), [colorMode])

    return (
        <>
            {/* <AutoFocusPlugin clickFunction={onClick} /> */}
            <Flex
                width={"100%"}
                // mt={2}
                p={2}
                borderRadius={"20px 20px 0 0"}
                backgroundColor={
                    colorMode === "light" ? "whiteAlpha.800"
                        : "blackAlpha.400"
                }
                // backgroundColor={"gray.200"}
                overflowX={
                    'hidden'
                    // shouldShowEllipsis ? 
                    // 'auto'
                    // : 'hidden'
                }
                justifyContent={"space-between"}
                display={"flex"}
                zIndex={2}

            >

                <>
                    <TimeButtons onClick={onClick} />
                    <VerticalDivider />
                    <BoldButton onClick={onClick} />
                    <ItalicsButton onClick={onClick} />
                    <UnderlineButton onClick={onClick} />
                    <VerticalDivider />
                    <SimpleFontFormatterButton />
                </>

            </Flex>
            <Divider />
        </>
    )
}