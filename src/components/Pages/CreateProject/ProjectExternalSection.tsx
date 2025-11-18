// Tab data for Project External Project info on the creation page.

import { AffiliationCreateSearchDropdown } from "@/components/Navigation/AffiliationCreateSearchDropdown";
import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { IAffiliation } from "@/types";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoIosCreate } from "react-icons/io";
// import { ICreateProjectExternalDetails } from "@/lib/api";
import "../../../styles/modalscrollbar.css";

interface IProjectExternalProps {
  //   externalFilled: boolean;
  //   setExternalFilled: React.Dispatch<React.SetStateAction<boolean>>;
  //   externalData: ICreateProjectExternalDetails;
  setExternalData: (data) => void;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
}

export const ProjectExternalSection = ({
  backClick,
  createClick,
  //   externalFilled,
  //   setExternalFilled,
  //   externalData,
  setExternalData,
}: IProjectExternalProps) => {
  const [externalDescription, setExternalDescription] = useState<string>("");
  const [aims, setAims] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [collaborationWith, setCollaborationWith] = useState<string>("");

  const [collaboratingPartnersArray, setCollaboratingPartnersArray] = useState<
    IAffiliation[] | null
  >([]);

  const addCollaboratingPartnersPkToArray = (affiliation: IAffiliation) => {
    setCollaborationWith((prevString) => {
      let updatedString = prevString.trim(); // Remove any leading or trailing spaces

      // Add a semicolon and a space if not already present
      if (updatedString && !/;\s*$/.test(updatedString)) {
        updatedString += "; ";
      }

      // Append affiliation name
      updatedString += affiliation.name.trim();

      // Check if the first two characters are a space and semicolon, remove them
      if (updatedString?.startsWith("; ")) {
        updatedString = updatedString.substring(2);
      }

      return updatedString;
    });
    setCollaboratingPartnersArray((prev) => [...prev, affiliation]);
  };

  const removeCollaboratingPartnersPkFromArray = (
    affiliation: IAffiliation,
  ) => {
    setCollaborationWith((prevString) => {
      // Use safe split/filter/join approach instead of regex
      const affiliations = prevString
        .split("; ")
        .filter((a) => a.trim() !== affiliation.name.trim());
      const updatedString = affiliations.join("; ");
      return updatedString;
    });

    setCollaboratingPartnersArray((prev) =>
      prev.filter((item) => item !== affiliation),
    );
  };

  const clearCollaboratingPartnersPkArray = () => {
    setCollaborationWith("");
    setCollaboratingPartnersArray([]);
  };
  useEffect(() => {
    setExternalData({
      externalDescription: externalDescription,
      aims: aims,
      budget: budget,
      collaborationWith: collaborationWith,
    });
  }, [externalDescription, aims, budget, collaborationWith]);

  //   useEffect(() => {
  //     if (
  //       externalDescription.length > 0 &&
  //       aims.length > 0 &&
  //       budget.length > 0 &&
  //       collaborationWith.length > 0
  //     ) {
  //       // console.log(externalData);
  //       setExternalFilled(true);
  //     } else {
  //       // console.log(
  //       //   externalDescription.length,
  //       //   budget.length,
  //       //   aims.length,
  //       //   collaborationWith.length
  //       // );
  //       setExternalFilled(false);
  //     }
  //   }, [
  //     externalData,
  //     aims,
  //     budget,
  //     collaborationWith,
  //     externalDescription,
  //     setExternalFilled,
  //   ]);

  const { colorMode } = useColorMode();

  useEffect(() => {});

  return (
    <Box px={8}>
      {/* <UnboundStatefulEditor
        title="Collaboration With"
        placeholder="Enter collaborating entities..."
        helperText={
          "The entity/s this project is in collaboration with, separated by commas"
        }
        showToolbar={false}
        showTitle={true}
        isRequired={true}
        value={collaborationWith}
        setValueFunction={setCollaborationWith}
        setValueAsPlainText={true}
      /> */}

      <FormControl>
        <AffiliationCreateSearchDropdown
          autoFocus
          isRequired={false}
          isEditable
          array={collaboratingPartnersArray}
          arrayAddFunction={addCollaboratingPartnersPkToArray}
          arrayRemoveFunction={removeCollaboratingPartnersPkFromArray}
          arrayClearFunction={clearCollaboratingPartnersPkArray}
          label="Collaboration With"
          placeholder="Search for or add a collaboration partner"
          helperText="The entity/s this project is in collaboration with"
        />
      </FormControl>

      {/* <Text>Collab with: {collaborationWith}</Text> */}

      <UnboundStatefulEditor
        title="Budget"
        placeholder="The estimated operating budget in dollars..."
        helperText={"The estimated budget for the project in dollars"}
        showToolbar={false}
        showTitle={true}
        isRequired={false}
        value={budget}
        setValueFunction={setBudget}
        setValueAsPlainText={true}
      />

      <UnboundStatefulEditor
        title="Description"
        helperText={"Description specific to this external project."}
        showToolbar={true}
        showTitle={true}
        isRequired={false}
        value={externalDescription}
        setValueFunction={setExternalDescription}
        setValueAsPlainText={false}
      />

      <UnboundStatefulEditor
        title="Aims"
        allowInsertButton
        helperText={"List out the aims of your project."}
        showToolbar={true}
        showTitle={true}
        isRequired={false}
        value={aims}
        setValueFunction={setAims}
        setValueAsPlainText={false}
      />

      <Flex w={"100%"} justifyContent={"flex-end"} pb={4}>
        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
          <Button colorScheme="gray" onClick={backClick}>
            Back
          </Button>

          <Button
            ml={3}
            type="submit"
            color={"white"}
            background={colorMode === "light" ? "blue.500" : "blue.600"}
            _hover={{
              background: colorMode === "light" ? "blue.400" : "blue.500",
            }}
            // isDisabled={!externalFilled}
            onClick={() => {
              createClick();
            }}
            rightIcon={<IoIosCreate />}
          >
            Create
          </Button>
        </Grid>
      </Flex>
    </Box>
  );
};
