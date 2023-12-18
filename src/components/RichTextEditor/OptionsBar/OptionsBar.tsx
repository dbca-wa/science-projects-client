// The options bar which sits below the text area in the simple rich text editor

import { Flex, Grid, useColorMode } from "@chakra-ui/react"
import { WordCount } from "./WordCount"
import { ClearButton } from "../Buttons/ClearButton";
import { SaveButton } from "../Buttons/SaveButton";
import { TreeButton } from "../Buttons/TreeButton";
import { LexicalEditor } from "lexical";
import { HideEditorButton } from "../Buttons/HideEditorButton";
import { EditorSections, EditorSubsections, EditorType } from "../../../types";
import { useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser";

interface IOptionsBarProps {
    // editor: LexicalEditor;
    writeable_document_kind?: EditorSections | null;
    writeable_document_pk?: number | null;

    isUpdate: boolean;
    editorText: string | null;
    editorType: EditorType;
    shouldShowTree: boolean;
    setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
    rawHTML: string;
    section: EditorSubsections;
    project_pk: number;
    document_pk: number;
    displayData: string;
    editorIsOpen: boolean;
    setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setDisplayData: React.Dispatch<React.SetStateAction<string>>;
}

export const OptionsBar = ({
    // editor,
    displayData, editorType, isUpdate,
    editorText, shouldShowTree, setShouldShowTree, writeable_document_kind, writeable_document_pk, rawHTML, editorIsOpen, setIsEditorOpen, setDisplayData, section, project_pk, document_pk }: IOptionsBarProps) => {
    const { colorMode } = useColorMode();

    // useEffect(() => console.log(displayData), [displayData])

    const { userData, userLoading } = useUser();


    return (


        editorIsOpen
        &&
        (
            <Flex
                // background={"orange"}
                height={20}
                width={"100%"}
                bottom={0}
            >
                <Flex
                    justifyContent="flex-start"
                    alignItems="center"
                    flex={1}
                    px={10}
                >
                    <WordCount text={editorText} />
                </Flex>

                <Flex justifyContent="flex-end" alignItems="center" flex={1}>

                    <Grid
                        px={10}
                        py={4}
                        gridTemplateColumns={`repeat(${userData?.is_superuser ? 3 : 2}, 1fr)`}
                        // width={"100%"}
                        gridColumnGap={2}
                    >
                        {userData?.is_superuser ?
                            (<TreeButton shouldShowTree={shouldShowTree} setShouldShowTree={setShouldShowTree} editorText={editorText} rawHTML={rawHTML} />
                            ) : null}

                        <ClearButton
                        // editor={editor}
                        />
                        {/* <UploadButton /> */}
                        {/* <DownloadButton /> */}
                        <SaveButton
                            writeable_document_pk={writeable_document_pk}
                            writeable_document_kind={writeable_document_kind}
                            setIsEditorOpen={setIsEditorOpen}
                            isUpdate={isUpdate}
                            editorType={editorType}
                            htmlData={displayData}
                            project_pk={project_pk}
                            document_pk={document_pk}
                            section={section}
                        />
                        {/* <HideEditorButton
                            setIsEditorOpen={setIsEditorOpen}
                            editorIsOpen={editorIsOpen}
                            // setDisplayData={setDisplayData}
                            editorText={editorText} rawHTML={rawHTML}
                        /> */}

                        {/* <MarkDownConversionButton /> */}
                    </Grid>
                </Flex>
            </Flex>

        )
        // :
        // (
        //     <Flex
        //         height={20}
        //         width={"100%"}
        //         pos={"absolute"}
        //         top={0}
        //     >
        //         <Flex
        //             justifyContent="flex-end"
        //             alignItems="center"
        //             flex={1}
        //         >
        //             <Grid
        //                 px={10}
        //                 py={4}
        //                 gridTemplateColumns={"repeat(1, 1fr)"}
        //                 // width={"100%"}
        //                 gridColumnGap={2}
        //             >

        //                 <HideEditorButton
        //                     setIsEditorOpen={setIsEditorOpen}
        //                     editorIsOpen={editorIsOpen}
        //                     // setDisplayData={setDisplayData}
        //                     editorText={editorText}
        //                     rawHTML={rawHTML}
        //                 />
        //             </Grid>
        //         </Flex>

        //     </Flex>
        // )

    )
}