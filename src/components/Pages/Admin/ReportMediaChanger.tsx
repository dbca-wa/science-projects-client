import {
  FileDropzone,
  SingleFileStateUpload,
} from "@/components/SingleFileStateUpload";
import { uploadReportMediaImage } from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/useNoImage";
import useServerImageUrl from "@/lib/hooks/useServerImageUrl";
import { IImageData } from "@/types";
import {
  Box,
  Center,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  Text,
  Image,
  InputGroup,
  useColorMode,
  FormLabel,
  Flex,
  Progress,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { TbPhotoFilled } from "react-icons/tb";
import { color } from "framer-motion";
import { FaCheck, FaCross } from "react-icons/fa";
import { ImCross } from "react-icons/im";

interface Props {
  section:
    | "cover"
    | "rear_cover"
    | "sdchart"
    | "service_delivery"
    | "research"
    | "partnerships"
    | "collaborations"
    | "student_projects"
    | "publications";
  helperText?: string;
  reportMediaData: any;
  reportPk: number;
  refetchData: () => void;
}

export const ReportMediaChanger = ({
  reportMediaData,
  section,
  reportPk,
  refetchData,
}: Props) => {
  const { colorMode } = useColorMode();
  const noImageLink = useNoImage();

  const titleDictionary = {
    cover: "Cover Page",
    sdchart: "Service Delivery Org Chart",
    service_delivery: "Service Delivery Chapter Image",
    research: "Research Chapter Image",
    partnerships: "Partnerships Chapter Image",
    collaborations: "Collaborations Chapter Image",
    student_projects: "Student Projects Chapter Image",
    publications: "Publications Chapter Image",
    rear_cover: "Rear Cover Page",
  };

  // const instantImageUploadMutation = useMutation()

  const [uploadedFile, setUploadedFile] = useState<File>();
  const [isError, setIsError] = useState(false);
  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };
  const queryClient = useQueryClient();

  const onFileDrop = async (acceptedFile) => {
    if (acceptedFile[0].type) {
      if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
        setIsError(true);
        return;
      } else {
        const mutationData = {
          file: acceptedFile[0],
          section: section,
          pk: reportPk,
        };
        fileDropMutation.mutate(mutationData);
      }
    }
  };

  const fileDropMutation = useMutation(uploadReportMediaImage, {
    onMutate: (mutationData) => {
      setIsError(false);
      setIsUploading(true);
      const newProgressInterval = startSimulatedProgress();
      setProgressInterval(newProgressInterval);

      addToast({
        status: "loading",
        title: `Uploading`,
        position: "top-right",
      });

      return mutationData;
    },
    onSuccess: async (data, mutationData) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Image Uploaded`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // onClose();
      setUploadedFile(mutationData.file);

      setTimeout(async () => {
        // if (setIsAnimating) {
        //     setIsAnimating(false)
        // }
        clearInterval(progressInterval);
        setUploadProgress(100);

        queryClient.invalidateQueries(["reportMedia", mutationData.pk]);

        await refetchData();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not delete document`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      clearInterval(progressInterval);
      setUploadProgress(0);
    },
  });

  //   useEffect(() => {
  //     if (!isUploading && !isError && uploadedFile) {
  //       console.log(uploadedFile);
  //     }
  //   }, [uploadedFile, isError, isUploading]);

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

  const [currentImage, setCurrentImage] = useState<string | null>(() => {
    const matches = reportMediaData.filter((i) => i.kind === section);
    if (matches.length < 1) {
      return null;
    } else {
      return matches[0].file;
    }
  });

  const baseUrl = useApiEndpoint();

  const [isHovered, setIsHovered] = useState(false);

  const onDeleteEntry = (e: any) => {
    e.preventDefault();
    console.log("delete");
  };

  return (
    <Box
      pos={"relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isHovered ? "pointer" : undefined}
    >
      {isHovered ? (
        <Box
          //   bg={"pink"}
          pos={"absolute"}
          right={4}
          bottom={4}
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
            borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
            background={colorMode === "light" ? "gray.100" : "gray.700"}
            border={"1px dashed"}
            rounded={"lg"}
            //   overflow={"hidden"}
            //   pos={"relative"}
          >
            {(acceptedFiles && !isError && acceptedFiles[0] instanceof File) ||
            (currentImage && currentImage !== null) ? (
              <Box w={"100%"} h={"100%"} pos={"relative"} rounded={"lg"}>
                <Box
                  pos={"absolute"}
                  bottom={0}
                  w={"100%"}
                  py={4}
                  px={4}
                  bg={"blackAlpha.800"}
                  roundedBottom={"lg"}
                  textAlign={"center"}
                  zIndex={99}
                >
                  <Text color={"white"}>{titleDictionary[section]}</Text>
                </Box>

                <Box overflow={"hidden"} w={"100%"} h={"100%"} rounded={"lg"}>
                  <Image
                    //   pos={"relative"}
                    rounded={"lg"}
                    src={
                      acceptedFiles &&
                      !isError &&
                      acceptedFiles[0] instanceof File
                        ? URL.createObjectURL(acceptedFiles[0])
                        : currentImage && currentImage !== null
                        ? `${baseUrl}${currentImage}`
                        : undefined
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
                    {`Drag and drop an image for the`}
                  </Text>
                  <Text
                    fontWeight={"semibold"}
                  >{`${titleDictionary[section]}`}</Text>
                </Grid>

                {!isError && acceptedFiles && acceptedFiles[0] ? (
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
                  <Text color={"red.500"} mt={4}>
                    That file is not of the correct type
                  </Text>
                ) : null}
              </Flex>
            )}
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};

// {currentImage && currentImage !== null ? (
//     <Grid rounded="lg" w={"100%"} h={"100%"}>
//       <Box h={60} rounded={"lg"}>
//         <Image
//           objectFit="cover"
//           src={`${baseUrl}${currentImage}`}
//           alt="Preview"
//           userSelect="none"
//           bg="gray.800"
//           w={"100%"}
//         />
//       </Box>
//       <Text fontWeight={"semibold"}>{titleDictionary[section]}</Text>
//     </Grid>
//   ) : (
