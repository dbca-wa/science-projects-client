import { DisplayRTE } from "@/shared/components/RichTextEditor/Editors/DisplayRTE";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { BusinessAreaImage, IUserMe } from "@/shared/types/index.d";
import {
  Box,
  Center,
  Icon,
  Text,
  useColorMode,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { EditMyBusinessAreaModal } from "./EditMyBusinessAreaModal";

interface IMyBaUpdateData {
  leader: IUserMe;
  pk: number;
  name: string;
  introduction: string;
  image: BusinessAreaImage;
  refetch: () => void;
}

export const BusinessAreaEditableDisplay = ({
  pk,
  name,
  introduction,
  image,
  leader,
  refetch,
}: IMyBaUpdateData) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const onMouseOver = () => {
    if (!isHovered) {
      setIsHovered(true);
    }
  };

  const onMouseOut = () => {
    if (isHovered) {
      setIsHovered(false);
    }
  };

  const NoImageFile = useNoImage();
  const apiEndpoint = useApiEndpoint();

  return (
    <>
      <EditMyBusinessAreaModal
        pk={pk}
        isOpen={isOpen}
        onClose={onClose}
        introduction={introduction}
        image={image?.file}
        refetch={refetch}
      />
      <Box
        overflow={"hidden"}
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        rounded={10}
        pb={8}
        mb={20}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseOut}
      >
        {/* BA image and title */}
        <Box
          rounded={4}
          // boxSize={"100px"}
          w={"100%"}
          h={"23vh"}
          minH={"285px"}
          pos={"relative"}
          userSelect={"none"}
          draggable={false}
        >
          <Box
            pos={"absolute"}
            right={0}
            bottom={"30px"}
            zIndex={0}
            width={"76%"}
            height={"70px"}
            display={"flex"}
            alignItems={"center"}
            bg={"rgba(255, 255, 255, 0.6)"}
            border={"3px solid #396494"}
            roundedLeft={30}
            borderRight={"none"}
          >
            <Text
              pl={4}
              fontWeight={"bold"}
              fontSize={"28px"}
              color={"black"}
              userSelect={"none"}
            >
              {name}
            </Text>
          </Box>
          <Image
            // pos={"absolute"}
            zIndex={0}
            src={
              image instanceof File
                ? `${apiEndpoint}${image.name}` // Use the image directly for File
                : image?.file
                  ? `${apiEndpoint}${image.file}`
                  : // : image instanceof string ?
                    NoImageFile
            }
            top={0}
            left={0}
            objectFit={"cover"}
            width={"100%"}
            height={"100%"}
            userSelect={"none"}
            draggable={false}
          />
        </Box>

        {/* Program Lead name and Text */}
        <Box mt={8} px={12} pos={"relative"}>
          {isHovered && (
            <Center
              bg={"green.500"}
              rounded={"full"}
              boxSize={"40px"}
              pos={"absolute"}
              right={12}
              mt={-4}
              _hover={{ cursor: "pointer" }}
              onClick={onOpen}
              color={"whitesmoke"}
            >
              <Icon as={FaEdit} boxSize={"20px"} ml={"3px"} mt={-0.5} />
            </Center>
          )}

          <Text fontWeight={"semibold"} textAlign={"justify"}>
            Program Leader: {leader?.first_name} {leader?.last_name}
          </Text>

          {introduction !== "" && (
            <Box pt={12}>
              <DisplayRTE payload={introduction} />
            </Box>
          )}

          {/* <Text
                    mt={4}
                    textAlign={"justify"}
                >
                    {distilledIntro}
                </Text> */}
        </Box>
      </Box>
    </>
  );
};
