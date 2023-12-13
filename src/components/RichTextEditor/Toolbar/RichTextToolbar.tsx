// Toolbar for the simple rich text editor

import { Box, Divider, Flex, useBreakpointValue, useColorMode } from "@chakra-ui/react"
// import { AlignButton } from "../MenuButtons/AlignButton"
import { RefObject, SetStateAction, useEffect, useState } from "react"
import { useToolbarClickListener } from "../../../lib/hooks/useToolbarClickListener"
import { TimeButtons } from "./TimeButtons";
import { ElementTypeButton } from "../MenuButtons/ElementTypeButton";
import { BoldButton } from "../Buttons/BoldButton";
import { VerticalDivider } from "./VerticalDivider";
import { InsertTableButton } from "../MenuButtons/InsertTableButton";
import { ItalicsButton } from "../Buttons/ItalicsButton";
import { UnderlineButton } from "../Buttons/UnderlineButton";
import { FontFormatterButton } from "../MenuButtons/FontFormatterButton";
import { ToolbarToggleBtn } from "../Buttons/ToolbarToggleBtn";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";


interface Props {
    editorRef: RefObject<HTMLTextAreaElement>;
    selectedNodeType: string;
    setSelectedNodeType: React.Dispatch<SetStateAction<string>>;
}

export const RichTextToolbar = ({ editorRef, selectedNodeType, setSelectedNodeType }: Props) => {

    const { onClick } = useToolbarClickListener({ currentlySelectedNode: selectedNodeType, editorRef: editorRef });
    const [editor] = useLexicalComposerContext();


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
                my={1}
                px={1}
                backgroundColor={
                    colorMode === "light" ? "whiteAlpha.800"
                        : "blackAlpha.400"
                }
                overflowX={
                    'hidden'
                }
                justifyContent={"space-between"}
                display={"flex"}
            >
                {
                    isSmall ?
                        (
                            <>
                                <TimeButtons onClick={onClick} editor={editor} />
                                <VerticalDivider />
                                {
                                    currentToolbarPage === 1 ?

                                        <>

                                            <BoldButton onClick={onClick} editor={editor} />
                                            <ItalicsButton onClick={onClick} editor={editor} />
                                            <UnderlineButton onClick={onClick} editor={editor} />
                                            {/* <FontHighlighterButton /> */}

                                        </>
                                        :
                                        currentToolbarPage === 2 ?
                                            <>
                                                <ElementTypeButton onClick={onClick} isSmall
                                                    currentlyClickedNode={selectedNodeType}
                                                    setCurrentlyClickedNode={setSelectedNodeType}
                                                />
                                                <VerticalDivider />
                                                <>
                                                    <FontFormatterButton />
                                                    {/* <AlignButton isSmall onClick={onClick} /> */}
                                                </>
                                            </>
                                            :

                                            <InsertTableButton />

                                }

                                <Box>
                                    <ToolbarToggleBtn
                                        page={currentToolbarPage}
                                        setPage={setCurrentToolbarPage}
                                        maxPages={3}
                                        isSmall
                                    />
                                </Box>
                            </>
                        ) :
                        (
                            shouldShowToolbarToggleBtnWhenNotSmall ?
                                (
                                    <>
                                        <TimeButtons onClick={onClick} editor={editor} />
                                        <VerticalDivider />
                                        {
                                            currentToolbarPageMd === 1 ?
                                                <>
                                                    {/* <FontStylingButtons /> */}

                                                    <BoldButton onClick={onClick} editor={editor} />
                                                    <ItalicsButton onClick={onClick} editor={editor} />
                                                    <UnderlineButton onClick={onClick} editor={editor} />
                                                </>

                                                : currentToolbarPageMd === 2 ?
                                                    <>
                                                        <ElementTypeButton onClick={onClick}
                                                            currentlyClickedNode={selectedNodeType}
                                                            setCurrentlyClickedNode={setSelectedNodeType}
                                                        />
                                                        <VerticalDivider />


                                                        {/* <VerticalDivider /> */}

                                                        <>
                                                            <FontFormatterButton />
                                                            {/* <AlignButton onClick={onClick} /> */}
                                                        </>
                                                    </>
                                                    :
                                                    <InsertTableButton />


                                        }
                                        <ToolbarToggleBtn
                                            page={currentToolbarPageMd}
                                            setPage={setCurrentToolbarPageMd}
                                            maxPages={3}
                                            isSmall
                                        />
                                    </>
                                ) :
                                (
                                    <>
                                        <TimeButtons onClick={onClick} editor={editor} />
                                        <VerticalDivider />
                                        <BoldButton onClick={onClick} editor={editor} />
                                        <ItalicsButton onClick={onClick} editor={editor} />
                                        <UnderlineButton onClick={onClick} editor={editor} />
                                        <VerticalDivider />

                                        <ElementTypeButton onClick={onClick} shouldFurtherConcat={true}

                                            currentlyClickedNode={selectedNodeType}
                                            setCurrentlyClickedNode={setSelectedNodeType}
                                        />
                                        <VerticalDivider />
                                        <FontFormatterButton />

                                        <VerticalDivider />
                                        <InsertTableButton />

                                    </>
                                )
                        )
                }
            </Flex>
            <Divider />
        </>
    )
}