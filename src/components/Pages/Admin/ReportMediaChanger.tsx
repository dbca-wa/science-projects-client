import { deleteReportMediaImage, uploadReportMediaImage } from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import {
  Box,
  Center,
  Flex,
  Grid,
  Image,
  Progress,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
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

  const [uploadedFile, setUploadedFile] = useState<File>();
  const [isError, setIsError] = useState(false);
  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
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

  const onDeleteEntry = (e) => {
    e.preventDefault();
    const data = {
      pk: reportPk,
      section: section,
    };
    deleteImageMutation.mutate(data);
  };

  const fileDropMutation = useMutation({
    mutationFn: uploadReportMediaImage,
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
      setUploadedFile(mutationData.file);
      setCurrentImage(URL.createObjectURL(mutationData.file));

      setTimeout(async () => {
        clearInterval(progressInterval);
        setUploadProgress(100);

        queryClient.invalidateQueries({
          queryKey: ["reportMedia", mutationData.pk],
        });

        await refetchData();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not upload image`,
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

  const deleteImageMutation = useMutation({
    mutationFn: deleteReportMediaImage,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Deleting File`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Image Deleted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      setUploadedFile(null);
      setCurrentImage(null);
      setUploadProgress(0);

      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["reportMedia", reportPk] });
        await refetchData();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not delete image`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

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

  return (
    <Box
      // bg={"red"}
      height={"400px"}
      pos={"relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isHovered ? "pointer" : undefined}
    >
      {(isHovered && currentImage) || (isHovered && uploadedFile) ? (
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
            h={"400px"}
            width={"100%"}
            background={colorMode === "light" ? "gray.100" : "gray.700"}
            border={"1px dashed"}
            borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
            rounded={"lg"}
          >
            {(acceptedFiles &&
              !isError &&
              currentImage !== null &&
              acceptedFiles[0] instanceof File) ||
            currentImage !== null ? (
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
                    rounded={"lg"}
                    src={
                      acceptedFiles &&
                      !isError &&
                      currentImage !== null &&
                      acceptedFiles[0] instanceof File
                        ? URL.createObjectURL(acceptedFiles[0])
                        : currentImage && currentImage !== null
                          ? `${baseUrl}${currentImage}`
                          : undefined
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
                    {`Drag and drop an image for the`}
                  </Text>
                  <Text
                    fontWeight={"semibold"}
                  >{`${titleDictionary[section]}`}</Text>
                </Grid>

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
