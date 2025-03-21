// Section to provide base information on a project before proceeding to the details and location

import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";
import {
  Box,
  Button,
  Flex,
  Grid,
  InputGroup,
  VisuallyHiddenInput,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { IUserData } from "../../../types";
import { StatefulMediaChanger } from "../Admin/StatefulMediaChanger";
import TagInput from "./TagInput";

interface IProjectBaseInformationProps {
  projectKind: string;
  onClose: () => void;
  colorMode: string;
  nextClick: (data) => void;
  currentYear: number;
  baseInformationFilled: boolean;
  setBaseInformationFilled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ProjectBaseInformation = ({
  projectKind,
  baseInformationFilled,
  setBaseInformationFilled,
  currentYear,
  nextClick,
  onClose,
  colorMode,
}: IProjectBaseInformationProps) => {
  const [showPulsate, setShowPulsate] = useState(false);

  useEffect(() => {
    if (baseInformationFilled === true) {
      // Start the pulsating effect
      setShowPulsate(true);
      // Stop the pulsating effect after a short delay (1 second in this example)
      setTimeout(() => {
        setShowPulsate(false);
      }, 1000);
    }
  }, [baseInformationFilled]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>("");

  // const handleFileInputChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const files = event.target.files;
  //   if (files && files.length > 0) {
  //     setSelectedFile(files[0]);
  //   }
  // };

  const queryClient = useQueryClient();
  const meData = queryClient.getQueryData<IUserData>(["me"]);

  const [projectTitle, setProjectTitle] = useState("");
  const [titleContainsHTML, setTitleContainsHTML] = useState(false);

  useEffect(() => {
    console.log(projectTitle);
    const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
    setTitleContainsHTML(htmlTagRegex.test(projectTitle));
  }, [projectTitle]);

  const [projectSummary, setProjectSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [titleLengthError, setTitleLengthError] = useState(false);

  const BASE_SIZE_WITH_ONE_CHARACTER = titleContainsHTML ? 84 : 1;
  const MIN_TITLE_LENGTH = BASE_SIZE_WITH_ONE_CHARACTER + 6;
  const MAX_TITLE_LENGTH = BASE_SIZE_WITH_ONE_CHARACTER + 150;

  useEffect(() => {
    // console.log(projectTitle.length);
    if (projectTitle.length >= MAX_TITLE_LENGTH) {
      setTitleLengthError(true);
    } else if (projectTitle?.length < MIN_TITLE_LENGTH) {
      setTitleLengthError(true);
    } else {
      setTitleLengthError(false);
    }
  }, [titleLengthError, projectTitle, MAX_TITLE_LENGTH, MIN_TITLE_LENGTH]);

  useEffect(() => {
    if (
      projectTitle !== "" &&
      projectSummary !== "" &&
      keywords.length !== 0 &&
      // selectedFile !== null &&
      meData !== undefined &&
      meData.pk !== 0 &&
      meData.pk !== undefined &&
      !titleLengthError
    ) {
      setBaseInformationFilled(true);
    } else {
      setBaseInformationFilled(false);
    }
  }, [
    titleLengthError,
    currentYear,
    meData,
    projectTitle,
    projectSummary,
    keywords,
    selectedFile,
    setBaseInformationFilled,
  ]);

  return (
    <>
      <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridColumnGap={10}>
        <Box>
          {/* ============================ HIDING PROJECT YEAR ============================ */}
          <InputGroup>
            <VisuallyHiddenInput
              type="text"
              placeholder="Year"
              value={currentYear}
            />
          </InputGroup>

          {/* ============================ HIDING PROJECT KIND ============================ */}
          <InputGroup>
            <VisuallyHiddenInput
              type="text"
              placeholder="Kind"
              value={projectKind}
            />
          </InputGroup>

          {/* ============================ PROJECT TITLE ============================ */}
          <UnboundStatefulEditor
            title="Project Title"
            // allowInsertButton
            helperText={
              titleLengthError
                ? projectTitle.length >= MAX_TITLE_LENGTH
                  ? "That title is too long!"
                  : "That title is too short" // if less than min
                : "The project title with formatting if required (e.g. for taxonomic names)."
            }
            helperTextColor={titleLengthError ? "red.500" : undefined}
            showToolbar={true}
            showTitle={true}
            isRequired={true}
            value={projectTitle}
            setValueFunction={setProjectTitle}
            setValueAsPlainText={false}
            // isPlain={true}
            shouldFocus={true}
          />

          {/* ============================ TAGS ============================ */}
          <TagInput setTagFunction={setKeywords} />

          {/* ============================ PROJECT SUMMARY ============================ */}
          <UnboundStatefulEditor
            title="Project Summary"
            // allowInsertButton
            helperText={
              "A concise project summary, or any additional useful information."
            }
            showToolbar={true}
            showTitle={true}
            isRequired={true}
            value={projectSummary}
            setValueFunction={setProjectSummary}
            setValueAsPlainText={false}
            shouldFocus={false}
          />
        </Box>

        {/* ============================ IMAGE ============================ */}
        <Box mb={4}>
          <StatefulMediaChanger
            helperText={"Upload an image that represents the project."}
            selectedImageUrl={selectedImageUrl}
            setSelectedImageUrl={setSelectedImageUrl}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </Box>
      </Grid>

      {/* ============================ SUBMISSION/CANCEL ============================ */}
      <Flex w={"100%"} justifyContent={"flex-end"} pb={4}>
        <Button onClick={onClose}>Cancel</Button>
        <motion.div
          animate={{
            scale: showPulsate ? [1, 1.2, 1] : 1, // Keyframes for pulsating effect
          }}
          transition={{
            repeat: showPulsate ? Infinity : 0,
            duration: 1, // Animation duration in seconds
          }}
        >
          <Button
            isDisabled={!baseInformationFilled}
            // colorScheme="blue"
            background={colorMode === "light" ? "blue.500" : "blue.600"}
            color={"white"}
            _hover={{
              background: colorMode === "light" ? "blue.400" : "blue.500",
            }}
            ml={3}
            onClick={() => {
              if (baseInformationFilled) {
                nextClick({
                  kind: projectKind,
                  year: currentYear,
                  creator: meData?.pk,
                  title: projectTitle,
                  description: projectSummary,
                  keywords: keywords,
                  imageData: selectedFile,
                });
              } else return;
            }}
          >
            Next &rarr;
          </Button>
        </motion.div>
      </Flex>
    </>
  );
};
