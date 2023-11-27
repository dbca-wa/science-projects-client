import { Box, Center, Flex, FormHelperText, Progress, Text, ToastId, useColorMode, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { useForm } from "react-hook-form";
import { BsCloudArrowUp } from "react-icons/bs";
import { FaFile, FaFilePdf } from "react-icons/fa";
import { TbPhotoFilled } from "react-icons/tb";


export interface IFileType {
    fileType: "pdf" | "image";
}

export const FileDropzone = ({ fileType, setUploadedFile, uploadedFile, isError, setIsError, extraText }:
    { fileType: "pdf" | "image", setUploadedFile: React.Dispatch<React.SetStateAction<File>>, uploadedFile: File, isError: boolean, setIsError: React.Dispatch<React.SetStateAction<boolean>>, extraText: string }) => {

    const [isUploading, setIsUploading] = useState<boolean>(true);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [progressInterval, setProgressInterval] = useState(null);

    const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const onFileDrop = async (acceptedFile) => {
        // if(acceptedFile.type)
        if (
            (fileType === "pdf" && (acceptedFile[0].type !== "application/pdf"))
            ||
            (fileType === "image" && (!acceptedImageTypes.includes(acceptedFile[0].type)))
        ) {
            setIsError(true);
            return;
        }
        setIsError(false);
        setIsUploading(true);
        const newProgressInterval = startSimulatedProgress();
        setProgressInterval(newProgressInterval);
        const res = await new Promise((resolve) => setTimeout(resolve, 1500));
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadedFile(acceptedFile[0]);
    }

    const startSimulatedProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval);
                    return prevProgress;
                }
                return prevProgress + 5
            })
        }, 500)
        return interval
    }

    return (
        <Dropzone
            multiple={false}
            onDrop={onFileDrop}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <Box
                    {...getRootProps()}
                    h={64}
                    m={4}
                    border={'1px dashed'}
                    borderColor={"gray.300"}
                    rounded={'lg'}
                >
                    <Box
                        display={'flex'}
                        justifyContent={"center"}
                        alignItems={"center"}
                        h={"100%"}
                        w={"100%"}
                    >
                        <Flex
                            background={"gray.100"}
                            flexDir={"column"}
                            justifyContent={"center"}
                            justifyItems={"center"}
                            alignItems={"center"}
                            pt={5}
                            pb={6}
                            w={"100%"}
                            h={"100%"}
                            userSelect={"none"}
                            _hover={{
                                cursor: "pointer"
                            }}
                        >
                            <Box
                            // boxSize={}
                            >
                                <BsCloudArrowUp
                                    size={"50px"}
                                    color="gray"
                                />

                            </Box>
                            {extraText === undefined ?
                                <Text>{`Drag and drop a ${fileType} file.`}</Text>
                                :
                                <Text>{`Drag and drop a ${fileType} file${extraText}.`}</Text>

                            }
                            {!isError && acceptedFiles && acceptedFiles[0] ? (
                                <Flex
                                    mt={4}
                                    maxW={"80%"}
                                    // w={"80%"}
                                    bg={"white"}
                                    justifyContent={"center"}
                                    rounded={"md"}
                                    overflow={"hidden"}
                                    outline={"1px"}
                                    outlineColor={"gray.800"}
                                    borderWidth={"1px"}
                                    // borderRightWidth={"0px"}
                                    // borderLeftWidth={"1px"}
                                    borderColor={"gray.300"}
                                >
                                    <Box
                                        p={3}
                                        h={"100%"}
                                        placeItems={"center"}
                                        alignItems={"center"}
                                        borderRight={"1px solid"}
                                        borderColor={"gray.100"}
                                    >
                                        <Box
                                            color={
                                                fileType === "pdf" ?
                                                    "red.500" : "blue.500"}
                                        >
                                            {fileType === "pdf" ?
                                                <FaFilePdf />
                                                : fileType === "image" ?
                                                    <TbPhotoFilled />

                                                    : <FaFile />
                                            }


                                        </Box>
                                    </Box>
                                    <Box
                                        flex={1}
                                        whiteSpace={"nowrap"}
                                        textOverflow={"ellipsis"}
                                        overflow={"hidden"}
                                        pl={2}
                                        pr={3}
                                        py={2}
                                        fontSize={"sm"}
                                        mt={"1px"}
                                    >
                                        {acceptedFiles[0].name}
                                    </Box>

                                </Flex>
                            ) : null}

                            {isUploading ? (
                                <Center
                                    w={"100%"}
                                    mt={4}
                                    maxW={"xs"}
                                    mx={"auto"}
                                >
                                    <Box
                                        w={"80%"}
                                        h={1}
                                        // bg={"gray.100"}

                                        px={1}
                                    >
                                        <Progress
                                            colorScheme={(uploadProgress === 100 && uploadedFile) ? "green" : "blue"}

                                            // isIndeterminate
                                            size={"xs"}
                                            value={uploadProgress}
                                        // hasStripe
                                        // animation={"step-start"}
                                        // 
                                        />

                                    </Box>


                                </Center>
                            ) : null}

                            {isError ?
                                (
                                    <Text
                                        color={"red.500"}
                                    >
                                        That file is not of the correct type
                                    </Text>
                                )

                                : null}
                        </Flex>
                    </Box>

                </Box>
            )}
        </Dropzone>
    )
}


interface Props {
    fileType: "pdf" | "image";
    uploadedFile: File;
    setUploadedFile: React.Dispatch<React.SetStateAction<File>>;
    isError: boolean;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    extraText?: string;
}


export const SingleFileUpload = ({ fileType, uploadedFile, setUploadedFile, isError, setIsError, extraText }: Props) => {
    return (
        <Box>
            <FileDropzone
                fileType={fileType}
                setUploadedFile={setUploadedFile} uploadedFile={uploadedFile}
                setIsError={setIsError} isError={isError}
                extraText={extraText}
            />
        </Box>
    );
};
