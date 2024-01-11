import {
  FileDropzone,
  SingleFileStateUpload,
} from "@/components/SingleFileStateUpload";
import { useNoImage } from "@/lib/hooks/useNoImage";
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
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { TbPhotoFilled } from "react-icons/tb";

interface Props {
  section:
    | "cover"
    | "rear_cover"
    | "sdschart"
    | "service_delivery"
    | "research"
    | "partnerships"
    | "collaborations"
    | "student_projects"
    | "publications";
  helperText?: string;
  currentImage: IImageData | null;
}

export const ReportMediaChanger = ({
  helperText,
  currentImage,
  section,
}: Props) => {
  const { colorMode } = useColorMode();
  const noImageLink = useNoImage();

  const titleDictionary = {
    cover: "Cover Page",
    sdschart: "Service Delivery Org Chart",
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
  const onFileDrop = async (acceptedFile) => {
    // if(acceptedFile.type)
    if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
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

  return (
    <Center
      maxH={{ base: "200px", xl: "225px" }}
      mt={1}
      rounded="lg"
      overflow="hidden"
    >
      <Box rounded="lg">
        <Flex flexDir="column" rounded="lg">
          {currentImage ? (
            <Image
              objectFit="cover"
              src={noImageLink}
              alt="Preview"
              userSelect="none"
              bg="gray.800"
            />
          ) : (
            <Dropzone multiple={false} onDrop={onFileDrop}>
              {({ getRootProps, getInputProps, acceptedFiles }) => (
                <Box
                  {...getRootProps()}
                  h={52}
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
                      background={
                        colorMode === "light" ? "gray.100" : "gray.700"
                      }
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

                      <Grid
                        flexDir={"column"}
                        alignItems={"center"}
                        textAlign={"center"}
                      >
                        <Text px={8} textAlign={"center"}>
                          {`Drag and drop an image for the`}
                        </Text>
                        <Text
                          fontWeight={"semibold"}
                        >{`${titleDictionary[section]}`}</Text>
                      </Grid>

                      {!isError && acceptedFiles && acceptedFiles[0] ? (
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
                      ) : null}

                      {isUploading ? (
                        <Center w={"100%"} mt={4} maxW={"xs"} mx={"auto"}>
                          <Box w={"80%"} h={1} px={1}>
                            <Progress
                              bg={
                                colorMode === "light" ? "gray.200" : "gray.900"
                              }
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
                  </Box>
                </Box>
              )}
            </Dropzone>
          )}
        </Flex>
      </Box>
    </Center>
  );
};
