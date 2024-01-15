import { deleteReportMediaImage, uploadReportMediaImage } from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/useNoImage";
import { BusinessAreaImage } from "@/types";
import {
  Box,
  Center,
  Grid,
  Text,
  Image,
  useColorMode,
  Flex,
  Progress,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
}

export const StatefulMediaChanger = ({
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };
  const queryClient = useQueryClient();

  const { colorMode } = useColorMode();

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();
  const apiEndpoint = useApiEndpoint();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const noImageLink = useNoImage();

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

  //   (e) => {
  //     const file = e.target.files?.[0];
  //     if (file) {
  //       setSelectedFile(file);
  //       setSelectedImageUrl(URL.createObjectURL(file));
  //     }
  //   }

  const onFileDrop = async (acceptedFile) => {
    setIsError(false);
    setIsUploading(true);
    const newProgressInterval = startSimulatedProgress();
    setProgressInterval(newProgressInterval);

    if (acceptedFile[0].type) {
      if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
        clearInterval(progressInterval);
        setIsError(true);
        return;
      } else {
        setSelectedFile(acceptedFile[0]);
        setSelectedImageUrl(URL.createObjectURL(acceptedFile[0]));
        // setUploadedFile(acceptedFile[0]);
        clearInterval(progressInterval);
        setUploadProgress(100);
      }
    }
  };

  const onDeleteEntry = (e: any) => {
    e.preventDefault();
    console.log("delete");
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setUploadProgress(0);

    //   const data = {
    //     pk: reportPk,
    //     section: section,
    //   };
    //   deleteImageMutation.mutate(data);
  };

  useEffect(() => {
    if (isError) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  }, [isError, progressInterval]);

  //   const deleteImageMutation = useMutation(deleteReportMediaImage, {
  //     onMutate: () => {
  //       addToast({
  //         status: "loading",
  //         title: `Deleting File`,
  //         position: "top-right",
  //       });
  //     },
  //     onSuccess: async () => {
  //       if (toastIdRef.current) {
  //         toast.update(toastIdRef.current, {
  //           title: "Success",
  //           description: `Image Deleted`,
  //           status: "success",
  //           position: "top-right",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //       setUploadedFile(null);
  //       setCurrentImage(null);
  //       setUploadProgress(0);

  //       // setTimeout(async () => {
  //       //   queryClient.invalidateQueries(["reportMedia", reportPk]);
  //       //   await refetchData();
  //       // }, 350);
  //     },
  //     onError: (error) => {
  //       if (toastIdRef.current) {
  //         toast.update(toastIdRef.current, {
  //           title: `Could not delete image`,
  //           description: `${error}`,
  //           status: "error",
  //           position: "top-right",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //     },
  //   });

  const baseUrl = useApiEndpoint();

  const [isHovered, setIsHovered] = useState(false);

  //   useEffect(() => {
  //     console.log({
  //       selected: selectedFile,
  //       image: image,
  //       imageUrl: selectedImageUrl,
  //     });
  //   }, [selectedFile, selectedImageUrl, image]);

  return (
    <Box
      pos={"relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isHovered ? "pointer" : undefined}
    >
      {isHovered && selectedImageUrl ? (
        <Box
          bg={"white"}
          padding={4}
          rounded={"full"}
          pos={"absolute"}
          right={4}
          top={4}
          color={isHovered ? "red.500" : "green.500"}
          _hover={{ color: "red.400" }}
          onClick={(e) => {
            onDeleteEntry(e);
          }}
          zIndex={99999}
        >
          <ImCross size={"25px"} />
        </Box>
      ) : null}

      <Dropzone multiple={false} onDrop={onFileDrop}>
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <Box
            {...getRootProps()}
            h={72}
            width={"100%"}
            // background={colorMode === "light" ? "gray.100" : "gray.700"}
            border={"1px dashed"}
            borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
            rounded={"lg"}
            //   overflow={"hidden"}
            //   pos={"relative"}
          >
            {
              //     acceptedFiles &&
              //     !isError &&
              //     selectedFile !== null &&
              //     acceptedFiles[0] instanceof File) ||
              //   selectedImageUrl !== null
              //   image?.file ||
              //   (selectedFile && selectedFile !== null) ||
              selectedImageUrl && selectedImageUrl !== undefined ? (
                <Box w={"100%"} h={"100%"} pos={"relative"} rounded={"lg"}>
                  <Box overflow={"hidden"} w={"100%"} h={"100%"} rounded={"lg"}>
                    <Image
                      //   pos={"relative"}
                      rounded={"lg"}
                      src={
                        selectedImageUrl
                          ? selectedImageUrl.startsWith("/files")
                            ? `${baseUrl}${selectedImageUrl}`
                            : selectedImageUrl
                          : NoImageFile
                        // selectedFile
                        //   ? URL.createObjectURL(selectedFile)
                        //   : image?.file
                        //   ? `${baseUrl}${image.file}`
                        //   : NoImageFile
                        // acceptedFiles &&
                        // !isError &&
                        // selectedFile !== null &&
                        // acceptedFiles[0] instanceof File
                        //   ? URL.createObjectURL(acceptedFiles[0])
                        //   : image?.file !== null
                        //   ? `${baseUrl}${image?.file}`
                        //   : undefined
                      }
                      objectFit={"cover"}
                      // zIndex={1}
                      //   pos={"absolute"}
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
                      {`${helperText}`}
                    </Text>
                  </Grid>

                  {/* {!isError && acceptedFiles && acceptedFiles[0] ? (
                      <Center>
                        <Flex
                          mt={4}
                          maxW={"80%"}
                          // w={"80%"}
                          bg={colorMode === "light" ? "white" : "gray.800"}
                          justifyContent={"center"}
                          rounded={"md"}
                          overflow={"hidden"}
                          outline={"1px"}
                          outlineColor={"gray.800"}
                          borderWidth={"1px"}
                          borderColor={
                            colorMode === "light" ? "gray.300" : "gray.600"
                          }
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
                            <Box color={"blue.500"}>
                              <TbPhotoFilled />
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
                      </Center>
                    ) : null} */}

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

                  {isError ? (
                    <Center>
                      <Text color={"red.500"} mt={4}>
                        That file is not of the correct type
                      </Text>
                    </Center>
                  ) : null}
                </Flex>
              )
            }
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};
