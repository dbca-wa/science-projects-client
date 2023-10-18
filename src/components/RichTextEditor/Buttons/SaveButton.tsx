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


interface Props {
    editorType: EditorType
}

export const SaveButton = ({ editorType }: Props) => {
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [editor] = useLexicalComposerContext();
    // console.log(editor)

    // useEffect(() => {
    //     if (editor && !isLocked) {
    //         const htmlString = $generateHtmlFromNodes(editor, null);
    //         console.log(htmlString)
    //     }
    // }, [editor, isLocked])


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
                    title: "Saving to DB...",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {
                // if (setIsAnimating) {
                //     setIsAnimating(true)

                // }


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
                    queryClient.invalidateQueries(["project",]);

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Save',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const saveProjectToDb = (formData: IHTMLSave) => {
        //
        htmlSaveProjectMutation.mutate(formData);

        console.log("Saving to db")
    }


    return (

        <BaseOptionsButton
            icon={FaSave}
            colorScheme="green"
            onClick={handleSubmit(
                // editorType === "project" ? 
                saveProjectToDb
                // : 
            )}
            toolTipText="Save changes"
        // toolTip={"Save changes"}
        />
    )
}
