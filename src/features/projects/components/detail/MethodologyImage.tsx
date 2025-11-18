import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { IProjectPlan } from "@/shared/types/index.d";
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
import { useEffect, useRef, useState } from "react"; // Added useRef
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { SaveMethodologyImageButton } from "./SaveMethodologyImageButton";
import { handleImageFileCompression } from "@/shared/utils/imageCompression";

interface Props {
  maxUploadSizeInMb: number;
  refetch: () => void;
  document: IProjectPlan;
  helperText?: string;
  selectedImageUrl: string | null;
  setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
}

export const MethodologyImage = ({
  maxUploadSizeInMb,
  refetch,
  document,
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef(null); // ref for the file input

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();

  // Function to open file browser
  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file selection from input
  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileDrop([files[0]]);
    }
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

  const onFileDrop = async (acceptedFile) => {
    handleImageFileCompression({
      acceptedFile: acceptedFile,
      acceptedImageTypes: acceptedImageTypes,
      maxSizeMB: maxUploadSizeInMb,
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

  const onDeleteEntryFromServer = () => {
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setUploadProgress(0);
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
    <Box pb={6}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={acceptedImageTypes.join(",")}
        onChange={handleFileInputChange}
      />

      <Flex
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
        roundedTop={20}
      >
        <Flex justifyContent="flex-start" alignItems={"center"}>
          <Text pl={8} my={0} py={3} fontWeight={"bold"} fontSize={"xl"}>
            Methodology Image
          </Text>
        </Flex>
        <Flex justifyContent="flex-end" flex={1}>
          <Grid
            pr={8}
            py={2}
            gridTemplateColumns={"repeat(2, 1fr)"}
            gridColumnGap={2}
          >
            <SaveMethodologyImageButton
              refetch={refetch}
              buttonType={"delete"}
              document={document}
              file={selectedFile}
              canSave={true}
              projectPlanPk={document?.pk}
              onDeleteEntry={onDeleteEntryFromServer}
            />
            <SaveMethodologyImageButton
              refetch={refetch}
              buttonType={
                document?.methodology_image === null ? "post" : "update"
              }
              document={document}
              file={selectedFile}
              canSave={true}
              projectPlanPk={document?.pk}
            />
          </Grid>
        </Flex>
      </Flex>

      <Box
        pos={"relative"}
        w={"100%"}
        boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
        bg={colorMode === "light" ? "whiteAlpha.400" : "blackAlpha.400"}
      >
        <Box
          pos={"relative"}
          h={"500px"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          cursor={"pointer"} // Always show pointer cursor to indicate clickability
        >
          {isHovered && selectedImageUrl && !document?.methodology_image ? (
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridRowGap={"10px"}
              right={4}
              top={4}
              pos={"absolute"}
            >
              <Box
                bg={"white"}
                padding={2}
                rounded={"full"}
                color={isHovered ? "red.500" : "green.500"}
                _hover={{ color: "red.400" }}
                onClick={(e) => {
                  onDeleteEntry(e);
                }}
                zIndex={99999}
              >
                <ImCross size={"25px"} />
              </Box>
            </Grid>
          ) : null}

          <Dropzone multiple={false} onDrop={onFileDrop}>
            {({ getRootProps, getInputProps }) => {
              // Extract only the dropzone props without the onClick handler
              const { onClick, ...rootProps } = getRootProps();

              return (
                <Box
                  {...rootProps}
                  h={"100%"}
                  width={"100%"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
                  roundedBottom={"lg"}
                  onClick={(e) => {
                    // Prevent default onClick behavior from Dropzone
                    e.stopPropagation();
                    // Trigger our file input instead
                    openFileBrowser();
                  }}
                >
                  <input {...getInputProps()} />
                  {selectedImageUrl && selectedImageUrl !== undefined ? (
                    <Box
                      w={"100%"}
                      h={"100%"}
                      pos={"relative"}
                      roundedBottom={"lg"}
                    >
                      <Box
                        overflow={"hidden"}
                        w={"100%"}
                        h={"100%"}
                        roundedBottom={"lg"}
                      >
                        <Image
                          roundedBottom={"lg"}
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
                          draggable="false"
                          className="pointer-events-none select-none"
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Flex
                      roundedBottom={"lg"}
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
                              bg={
                                colorMode === "light" ? "gray.200" : "gray.900"
                              }
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
      </Box>
    </Box>
  );
};
