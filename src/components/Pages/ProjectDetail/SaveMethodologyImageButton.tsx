// A template for a RTE toggalable button - props fill out its icons, colorSchemes, states and functionality

import { IHandleMethodologyImage, handleMethodologyImage } from "@/lib/api";
import { Button, Center, Icon, Spinner, ToastId, useColorMode, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import "../../../styles/texteditor.css";
import { IProjectPlan } from "@/types";

interface Props {
    buttonType: "post" | "update" | "delete";
    document: IProjectPlan;
    canSave: boolean;
    projectPlanPk: number;
    file?: File | string;
    refetch: () => void;
    onDeleteEntry?: () => void;
}

export const SaveMethodologyImageButton = ({ canSave, projectPlanPk, file, buttonType
    , document, refetch, onDeleteEntry
}: Props) => {
    const { colorMode } = useColorMode();
    const toolTipText = `${buttonType === 'post' ? "Save" : buttonType === "update" ? "Update" : "Delete"} Methodology Image`

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };

    // const { register, handleSubmit, watch } = useForm<IHandleMethodologyImage>();
    // const ppPkWatch = watch("project_plan_pk");
    // const kindWatch = watch("kind");
    // const fileWatch = watch("file");

    const handleMethImageMutation = useMutation(handleMethodologyImage, {
        onMutate: () => {
            addToast({
                status: "loading",
                title: buttonType === "update" ? "Updating..." : buttonType === "delete" ? "Deleting..." : "Saving...",
                position: "top-right",
            });
        },
        onSuccess: () => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `${buttonType === "update" ? "Updated" : buttonType === "delete" ? "Deleted" : "Saved"} Methodology Image`,
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
            if (buttonType === "delete") {
                onDeleteEntry();
            }
            refetch();
            //   setTimeout(() => {
            //     if (softRefetch) {
            //       softRefetch();
            //     }
            //     setIsEditorOpen(false);
            //   }, 350);
        },
        onError: (error) => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: `Could Not ${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}`,
                    description: `${error}`,
                    status: "error",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
        },
    });

    const saveToDB = (formData: IHandleMethodologyImage) => {
        handleMethImageMutation.mutate(formData);
    };

    return (
        <div className="tooltip-container">
            <Button
                bg={
                    colorMode === "light" ? buttonType === "delete" ?
                        "red.500" : "green.500" : buttonType === "delete" ? "red.600" : "green.600"}
                color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
                _hover={{
                    color: "white",
                    bg:
                        buttonType !== "delete" ?
                            colorMode === "light" ? "green.600" : "green.700"
                            :
                            colorMode === "light" ? "red.600" : "red.700"
                }
                }
                isDisabled={
                    handleMethImageMutation.isLoading ||
                        buttonType === "delete" ? !document?.methodology_image :
                        !canSave || !file}
                onClick={() => {
                    console.log(buttonType)
                    saveToDB({
                        kind: buttonType,
                        project_plan_pk: projectPlanPk,
                        file: file,
                    })
                }}
                rounded={"full"}
                w={"35px"}
                h={"40px"}
            >
                {handleMethImageMutation.isLoading ? (
                    <Center>
                        <Spinner size="sm" />
                    </Center>
                )
                    :
                    (
                        <Icon as={buttonType === "delete" ? FaTrash : FaSave} boxSize={6} />
                    )
                }
            </Button>
            {toolTipText && <span className="tooltip-text">{toolTipText}</span>}
        </div>
    );
};