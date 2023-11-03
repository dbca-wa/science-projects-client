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


interface Props {
    editorRef: RefObject<HTMLTextAreaElement>;
    selectedNodeType: string;
    setSelectedNodeType: React.Dispatch<SetStateAction<string>>;
}

export const RichTextToolbar = ({ editorRef, selectedNodeType, setSelectedNodeType }: Props) => {

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
            >
                {
                    isSmall ?
                        (
                            <>
                                <TimeButtons onClick={onClick} />
                                <VerticalDivider />
                                {
                                    currentToolbarPage === 1 ?
                                        <>
                                            <ElementTypeButton onClick={onClick} isSmall
                                                currentlyClickedNode={selectedNodeType}
                                                setCurrentlyClickedNode={setSelectedNodeType}
                                            />
                                            <VerticalDivider />

                                            <InsertButton />
                                        </> :
                                        currentToolbarPage === 2 ?
                                            <>

                                                <BoldButton onClick={onClick} />
                                                <ItalicsButton onClick={onClick} />
                                                <UnderlineButton onClick={onClick} />
                                                {/* <FontHighlighterButton /> */}

                                            </>
                                            :
                                            <>
                                                <FontFormatterButton />
                                                <AlignButton isSmall onClick={onClick} />
                                            </>
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
                                        <TimeButtons onClick={onClick} />
                                        <VerticalDivider />
                                        {
                                            currentToolbarPageMd === 1 ?
                                                <>
                                                    <ElementTypeButton onClick={onClick}
                                                        currentlyClickedNode={selectedNodeType}
                                                        setCurrentlyClickedNode={setSelectedNodeType}
                                                    />
                                                    <VerticalDivider />

                                                    <InsertButton />

                                                    {/* <VerticalDivider /> */}


                                                </> : currentToolbarPageMd === 2 ?
                                                    <>
                                                        {/* <FontStylingButtons /> */}

                                                        <BoldButton onClick={onClick} />
                                                        <ItalicsButton onClick={onClick} />
                                                        <UnderlineButton onClick={onClick} />
                                                    </> :
                                                    <>
                                                        <FontFormatterButton />
                                                        <AlignButton onClick={onClick} />
                                                    </>
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
                                        <TimeButtons onClick={onClick} />
                                        <VerticalDivider />

                                        <ElementTypeButton onClick={onClick} shouldFurtherConcat={true}

                                            currentlyClickedNode={selectedNodeType}
                                            setCurrentlyClickedNode={setSelectedNodeType}
                                        />
                                        <VerticalDivider />
                                        <InsertButton />
                                        <VerticalDivider />
                                        <FontFormatterButton />

                                        <VerticalDivider />
                                        <BoldButton onClick={onClick} />
                                        <ItalicsButton onClick={onClick} />
                                        <UnderlineButton onClick={onClick} />
                                        <VerticalDivider />

                                        <AlignButton onClick={onClick} />

                                    </>
                                )
                        )
                }
            </Flex>
            <Divider />
        </>
    )
}