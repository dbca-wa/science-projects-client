// The project card used in the traditional layout's accordion section for projects

import {
  Box,
  Button,
  Grid,
  Image,
  Tag,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { AiFillCalendar, AiFillTag } from "react-icons/ai";
import { TbAlertOctagonFilled } from "react-icons/tb";
import { Link } from "react-router-dom";
import PlaceHolderImage from "../../../assets/no-image-placeholder.png";

export interface IProjectCardProps {
  pk: number;
  projectTitle: string;
  authors: string[];
  years: string;
  tags: string[];
  projectTypeTag: string;
  statusTag: string;
  imageUrl: string;
}

export const TraditionalProjectCard = ({
  pk,
  projectTitle,
  imageUrl,
  years,
  authors,
  tags,
  statusTag,
  projectTypeTag,
}: IProjectCardProps) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <Grid
        minH={"100px"}
        bg={colorMode === "dark" ? "blackAlpha.400" : "blackAlpha.200"}
        rounded={"lg"}
        mb={4}
        p={4}
        templateColumns={{
          base: "repeat(1, 1fr)",
          xl: "40% 60%",
        }}
        gap={3}
      >
        <Box
          position={"relative"}
          width="100%"
          paddingTop="56.25%" // For 16.9 aspect ratio
          overflow={"hidden"}
        >
          <Image
            src={imageUrl !== "" ? imageUrl : PlaceHolderImage}
            width="100%"
            height="100%"
            position="absolute"
            top="0" // These four keep the image where it should be
            right="0"
            bottom="0"
            left="0"
            objectFit={"cover"} // prevent image stretch
            rounded={"2xl"}
            userSelect={"none"}
            draggable={false}
          />
        </Box>

        <Box px={2} pb={10}>
          <Box pb={6}>
            <Button
              as={Link}
              to={`/projects/${pk}`}
              fontSize="xl"
              fontWeight="bold"
              variant={"link"}
              colorScheme="facebook"
              my={2}
              whiteSpace={"normal"} // breaks the word
              textOverflow={"ellipsis"}
            >
              {projectTitle}
            </Button>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize={"sm"}
            >
              {authors.map(
                (author, index) =>
                  `${author}${index !== authors.length - 1 ? ", " : ""}`
              )}
            </Text>
          </Box>
          <Grid flexDir={"row"} templateColumns={"repeat(1, 1fr)"}>
            <Box pb={4} display="inline-flex" alignItems="center">
              <TbAlertOctagonFilled />
              <Grid
                gridTemplateColumns={{
                  base: "repeat(2, 1fr)",
                }}
                gridGap={3}
                ml={3}
                gap={4}
              >
                <Tag
                  p={1.5}
                  bgColor={
                    projectTypeTag === "Core Function"
                      ? "blue.500"
                      : projectTypeTag === "Science"
                      ? "green.500"
                      : projectTypeTag === "Student"
                      ? "blue.400"
                      : "gray.400"
                  }
                  textColor={"whiteAlpha.900"}
                  fontSize={"xs"}
                  textAlign={"center"}
                  justifyContent={"center"}
                >
                  {projectTypeTag}
                </Tag>

                <Tag
                  p={1.5}
                  bgColor={
                    statusTag === "Completed"
                      ? "green.800"
                      : statusTag === "Update Requested"
                      ? "red.500"
                      : statusTag === "Active"
                      ? "green.300"
                      : "gray.200"
                  }
                  textColor={"whiteAlpha.900"}
                  fontSize={"xs"}
                  textAlign={"center"}
                  justifyContent={"center"}
                >
                  {statusTag}
                </Tag>
              </Grid>
            </Box>
            {years ? (
              <Box pb={4} display="inline-flex" alignItems="center">
                <AiFillCalendar size={"16px"} />
                <Grid
                  ml={2}
                  templateColumns={{
                    base: "repeat(1, 1fr)",
                    lg: "repeat(2, 1fr)",
                    xl: "repeat(auto, 1fr)",
                  }}
                  gridTemplateColumns={{
                    base: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                  }}
                  gridTemplateRows={"28px"}
                  gap={4}
                >
                  <Tag
                    ml={1}
                    bgColor={
                      colorMode === "dark" ? "gray.600" : "blackAlpha.100"
                    }
                  >
                    {years}
                  </Tag>
                </Grid>
              </Box>
            ) : (
              <Text>No dates provided.</Text>
            )}
            {tags.length !== 0 ? (
              <Box display="inline-flex" pb={4}>
                <AiFillTag size={"16px"} />
                <Grid
                  ml={3}
                  gridTemplateColumns={{
                    base: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(3, 1fr)",
                    "2xl": "repeat(4, 1fr)",
                  }}
                  gridTemplateRows={"28px"}
                  gap={4}
                >
                  {tags.map((tag, index) => {
                    return (
                      <Tag
                        bgColor={
                          colorMode === "dark" ? "gray.600" : "blackAlpha.100"
                        }
                        size={"sm"}
                        key={index}
                        textAlign={"center"}
                        justifyContent={"center"}
                        p={"10px"}
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </Grid>
              </Box>
            ) : (
              <Text>No tags provided.</Text>
            )}
          </Grid>
        </Box>
      </Grid>
    </>
  );
};
