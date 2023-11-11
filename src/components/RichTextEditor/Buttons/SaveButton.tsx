// A button to control whether the box is editable.
// This will by default be implemented once a document has been approved.
// Only the system, directorate or program leader can click the button again to enable editing.

import { Box, Button, ToastId, useColorMode, useToast } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { BsUnlockFill, BsLockFill } from "react-icons/bs"
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { BaseOptionsButton } from "./BaseOptionsButton";
import { FaSave } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { IHTMLSave, saveHtmlToDB } from "../../../lib/api";
import { EditorType } from "../../../types";


export const SaveButton = ({ editorType, htmlData, project_pk, document_pk, section, isUpdate, writeable_document_kind, writeable_document_pk, softRefetch, setIsEditorOpen }: IHTMLSave) => {
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [editor] = useLexicalComposerContext();
    // console.log(editor)

    // useEffect(() => {
    //     if (editor && !isLocked) {
    //         const htmlString = $generateHtmlFromNodes(editor, null);
    //         console.log(htmlString)
    //     }
    // }, [editor, isLocked])

    useEffect(() => console.log(htmlData), [htmlData])


    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<IHTMLSave>();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    const htmlSaveProjectMutation = useMutation(saveHtmlToDB,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Updating...",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Saved Text`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // reset()
                // onAddTaskClose()

                setTimeout(() => {
                    // if (setIsAnimating) {
                    //     setIsAnimating(false)
                    // }
                    // queryClient.invalidateQueries(["project", project_pk]);
                    // queryClient.invalidateQueries(["project"]);
                    if (softRefetch) {
                        softRefetch();

                    }
                    setIsEditorOpen(false);
                    // refetchData();

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Update',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const saveToDB = (formData: IHTMLSave) => {
        //
        console.log("Saving to db")
        // console.log({
        //     "editorType": formData.editorType,
        //     "htmlData": formData.htmlData,
        //     "project_pk": formData.project_pk,
        //     "document_pk": formData.document_pk,
        //     "section": formData.section,
        // })

        htmlSaveProjectMutation.mutate(formData);

    }


    return (

        <BaseOptionsButton
            icon={FaSave}
            colorScheme="green"
            onClick={() => saveToDB(
                {
                    editorType, htmlData, project_pk, document_pk, section, isUpdate,
                    writeable_document_kind, writeable_document_pk
                })}
            toolTipText="Save changes"
        // toolTip={"Save changes"}
        />
    )
}
