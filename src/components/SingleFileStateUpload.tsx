import {
  Box,
  Center,
  Flex,
  Progress,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { FaFile, FaFilePdf } from "react-icons/fa";
import { TbPhoto } from "react-icons/tb";
import imageCompression from "browser-image-compression";

export interface IFileType {
  fileType: "pdf" | "image";
}

export const FileDropzone = ({
  fileType,
  setUploadedFile,
  uploadedFile,
  isError,
  setIsError,
  extraText,
}: {
  fileType: "pdf" | "image";
  setUploadedFile: React.Dispatch<React.SetStateAction<File>>;
  uploadedFile: File;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  extraText: string;
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const { colorMode } = useColorMode();

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const onFileDrop = async (acceptedFile) => {
    // if(acceptedFile.type)
    if (
      (fileType === "pdf" && acceptedFile[0].type !== "application/pdf") ||
      (fileType === "image" &&
        !acceptedImageTypes.includes(acceptedFile[0].type))
    ) {
      setIsError(true);
      return;
    }
    setIsError(false);
    setIsUploading(true);
    const newProgressInterval = startSimulatedProgress();
    setProgressInterval(newProgressInterval);

    // Implement compression
    let fileToUpload = acceptedFile[0];
    const MAX_SIZE_MB = 2;
    if (fileToUpload.size > MAX_SIZE_MB * 1024 * 1024) {
      console.log(`${fileToUpload.size} size too large compressing`);
      try {
        const options = {
          maxSizeMB: MAX_SIZE_MB,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(fileToUpload, options);
      } catch (error) {
        console.error("Error during image compression:", error);
        setIsError(true);
        setIsUploading(false);
        clearInterval(progressInterval);
        return;
      }
    }
    setTimeout(() => {
      clearInterval(newProgressInterval);
      setUploadProgress(100);
      setUploadedFile(fileToUpload);
      setIsUploading(false);
    }, 1500);
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };

  useEffect(() => {
    if (!uploadedFile) {
      setUploadProgress(0);
    }
  }, [uploadedFile]);

  return (
    <Dropzone multiple={false} onDrop={onFileDrop}>
      {({
        getRootProps,
        // getInputProps,
        acceptedFiles,
      }) => (
        <Box
          {...getRootProps()}
          h={64}
          m={4}
          border={"1px dashed"}
          borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
          rounded={"lg"}
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"100%"}
            w={"100%"}
            rounded={"lg"}
          >
            <Flex
              rounded={"lg"}
              background={colorMode === "light" ? "gray.100" : "gray.700"}
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
                cursor: "pointer",
              }}
            >
              <Box
              // boxSize={}
              >
                <BsCloudArrowUp size={"50px"} color="gray" />
              </Box>
              {extraText === undefined ? (
                <Text
                  px={8}
                  textAlign={"center"}
                >{`Drag and drop a ${fileType} file.`}</Text>
              ) : (
                <Text px={8} textAlign={"center"}>{`Drag and drop ${
                  fileType === "image" ? "an" : "a"
                } ${fileType} file${extraText}.`}</Text>
              )}
              {!isError && acceptedFiles && acceptedFiles[0] && uploadedFile ? (
                <Flex
                  mt={4}
                  maxW={"80%"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  justifyContent={"center"}
                  rounded={"md"}
                  overflow={"hidden"}
                  outline={"1px"}
                  outlineColor={"gray.800"}
                  borderWidth={"1px"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                >
                  <Box
                    p={3}
                    h={"100%"}
                    placeItems={"center"}
                    alignItems={"center"}
                    borderRight={"1px solid"}
                    borderColor={
                      colorMode === "light" ? "gray.300" : "gray.600"
                    }
                  >
                    <Box color={fileType === "pdf" ? "red.500" : "blue.500"}>
                      {fileType === "pdf" ? (
                        <FaFilePdf />
                      ) : fileType === "image" ? (
                        <TbPhoto />
                      ) : (
                        <FaFile />
                      )}
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
                <Center w={"100%"} mt={4} maxW={"xs"} mx={"auto"}>
                  <Box w={"80%"} h={1} px={1}>
                    <Progress
                      bg={colorMode === "light" ? "gray.200" : "gray.900"}
                      colorScheme={
                        uploadProgress === 100 && uploadedFile
                          ? "green"
                          : "blue"
                      }
                      size={"xs"}
                      value={uploadProgress}
                    />
                  </Box>
                </Center>
              ) : null}

              {isError ? (
                <Text color={"red.500"} mt={4}>
                  That file is not of the correct type
                </Text>
              ) : null}
            </Flex>
          </Box>
        </Box>
      )}
    </Dropzone>
  );
};

interface Props {
  fileType: "pdf" | "image";
  uploadedFile: File;
  setUploadedFile: React.Dispatch<React.SetStateAction<File>>;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  extraText?: string;
}

export const SingleFileStateUpload = ({
  fileType,
  uploadedFile,
  setUploadedFile,
  isError,
  setIsError,
  extraText,
}: Props) => {
  return (
    <Box>
      <FileDropzone
        fileType={fileType}
        setUploadedFile={setUploadedFile}
        uploadedFile={uploadedFile}
        setIsError={setIsError}
        isError={isError}
        extraText={extraText}
      />
    </Box>
  );
};
