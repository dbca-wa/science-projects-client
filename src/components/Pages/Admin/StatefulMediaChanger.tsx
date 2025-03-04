import { handleImageFileCompression } from "@/lib/hooks/helper/handleImageFileCompression";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import {
  Box,
  Center,
  Flex,
  Grid,
  Image,
  Progress,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";

interface Props {
  helperText?: string;
  selectedImageUrl: string | null;
  setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
  clearImageAddedFunctionality?: () => void;
}

export const StatefulMediaChanger = ({
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
  clearImageAddedFunctionality,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();

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

  const handleFileSelection = async (files) => {
    if (files && files.length > 0) {
      await onFileDrop([files[0]]);
    }
  };

  const onFileDrop = async (acceptedFile) => {
    handleImageFileCompression({
      acceptedFile: acceptedFile,
      acceptedImageTypes: acceptedImageTypes,
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      setIsErrorFn: setIsError,
      setIsUploadingFn: setIsUploading,
      setSelectedFileFn: setSelectedFile,
      setSelectedImageUrlFn: setSelectedImageUrl,
      setUploadProgressFn: setUploadProgress,
      setProgressIntervalFn: setProgressInterval,
      startSimulatedProgressFn: startSimulatedProgress,
      progressInterval: progressInterval,
    });
  };

  const onDeleteEntry = (e) => {
    e.preventDefault();
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setUploadProgress(0);
  };

  // Handler for file input change event
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (isError) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  }, [isError, progressInterval]);

  const baseUrl = useApiEndpoint();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      pos={"relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isHovered ? "pointer" : undefined}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={acceptedImageTypes.join(",")}
        onChange={handleFileInputChange}
      />

      {isHovered &&
      selectedImageUrl &&
      selectedImageUrl !== null &&
      !selectedImageUrl.endsWith("undefined") ? (
        <Box
          bg={"white"}
          padding={4}
          rounded={"full"}
          pos={"absolute"}
          right={4}
          top={4}
          color={isHovered ? "red.500" : "green.500"}
          _hover={{ color: "red.400" }}
          onClick={async (e) => {
            onDeleteEntry(e);
            if (clearImageAddedFunctionality) {
              console.log("Clearing image");
              await clearImageAddedFunctionality();
              console.log("cleared");
            }
          }}
          zIndex={99999}
        >
          <ImCross size={"25px"} />
        </Box>
      ) : null}

      <Dropzone multiple={false} onDrop={onFileDrop}>
        {({ getRootProps, getInputProps, acceptedFiles }) => {
          // Extract only the dropzone props without the onClick handler
          const { onClick, ...rootProps } = getRootProps();

          return (
            <Box
              {...rootProps}
              h={72}
              width={"100%"}
              border={"1px dashed"}
              borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
              rounded={"lg"}
              onClick={(e) => {
                // Prevent default onClick behavior from Dropzone
                e.stopPropagation();
                // Trigger our file input instead
                triggerFileInput();
              }}
            >
              <input {...getInputProps()} />
              {selectedImageUrl &&
              selectedImageUrl !== undefined &&
              selectedImageUrl !== null &&
              !selectedImageUrl.endsWith("undefined") ? (
                <Box w={"100%"} h={"100%"} pos={"relative"} rounded={"lg"}>
                  <Box overflow={"hidden"} w={"100%"} h={"100%"} rounded={"lg"}>
                    <Image
                      rounded={"lg"}
                      src={
                        selectedImageUrl
                          ? selectedImageUrl?.startsWith("/files")
                            ? `${baseUrl}${selectedImageUrl}`
                            : selectedImageUrl
                          : NoImageFile
                      }
                      objectFit={"cover"}
                      w={"100%"}
                      h={"100%"}
                    />
                  </Box>
                </Box>
              ) : (
                <Flex
                  rounded={"lg"}
                  flexDir={"column"}
                  justifyContent={"center"}
                  justifyItems={"center"}
                  w={"100%"}
                  h={"100%"}
                  background={"blackAlpha.800"}
                  zIndex={3}
                >
                  <Center
                    flexDir={"column"}
                    justifyContent={"center"}
                    justifyItems={"center"}
                  >
                    <BsCloudArrowUp size={"50px"} color={"white"} />
                  </Center>

                  <Grid
                    flexDir={"column"}
                    alignItems={"center"}
                    textAlign={"center"}
                    color={"white"}
                  >
                    <Text px={8} textAlign={"center"}>
                      {`${helperText || "Click or drop image here"}`}
                    </Text>
                  </Grid>

                  {isUploading ? (
                    <Center w={"100%"} mt={4} maxW={"xs"} mx={"auto"}>
                      <Box w={"80%"} h={1} px={1}>
                        <Progress
                          bg={colorMode === "light" ? "gray.200" : "gray.900"}
                          colorScheme={
                            uploadProgress === 100 && selectedFile
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
                    <Center>
                      <Text color={"red.500"} mt={4}>
                        That file is not of the correct type
                      </Text>
                    </Center>
                  ) : null}
                </Flex>
              )}
            </Box>
          );
        }}
      </Dropzone>
    </Box>
  );
};
