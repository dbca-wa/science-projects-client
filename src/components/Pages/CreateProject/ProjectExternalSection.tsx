// Tab data for Project External Project info on the creation page.

import { Button, Flex, Grid, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { IoIosCreate } from "react-icons/io";
import { ICreateProjectExternalDetails } from "../../../lib/api";
import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";

interface IProjectExternalProps {
  externalFilled: boolean;
  setExternalFilled: React.Dispatch<React.SetStateAction<boolean>>;
  externalData: ICreateProjectExternalDetails;
  setExternalData: (data) => void;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
}

export const ProjectExternalSection = ({
  backClick,
  createClick,
  externalFilled,
  setExternalFilled,
  externalData,
  setExternalData,
}: IProjectExternalProps) => {
  const [externalDescription, setExternalDescription] = useState<string>("");
  const [aims, setAims] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [collaborationWith, setCollaborationWith] = useState<string>("");

  useEffect(() => {
    setExternalData({
      externalDescription: externalDescription,
      aims: aims,
      budget: budget,
      collaborationWith: collaborationWith,
    });
  }, [externalDescription, aims, budget, collaborationWith]);

  useEffect(() => {
    if (
      externalDescription.length > 0 &&
      aims.length > 0 &&
      budget.length > 0 &&
      collaborationWith.length > 0
    ) {
      // console.log(externalData);
      setExternalFilled(true);
    } else {
      // console.log(
      //   externalDescription.length,
      //   budget.length,
      //   aims.length,
      //   collaborationWith.length
      // );
      setExternalFilled(false);
    }
  }, [
    externalData,
    aims,
    budget,
    collaborationWith,
    externalDescription,
    setExternalFilled,
  ]);

  const { colorMode } = useColorMode();

  return (
    <>
      <UnboundStatefulEditor
        title="Collaboration With"
        placeholder="Enter collaborating entities..."
        helperText={"The entity/s this project is in collaboration with, separated by commas"}
        showToolbar={false}
        showTitle={true}
        isRequired={true}
        value={collaborationWith}
        setValueFunction={setCollaborationWith}
        setValueAsPlainText={true}
      />

      <UnboundStatefulEditor
        title="Budget"
        placeholder="The estimated operating budget in dollars..."
        helperText={"The estimated budget for the project in dollars"}
        showToolbar={false}
        showTitle={true}
        isRequired={true}
        value={budget}
        setValueFunction={setBudget}
        setValueAsPlainText={true}
      />

      <UnboundStatefulEditor
        title="Description"
        helperText={"Description specific to this external project."}
        showToolbar={true}
        showTitle={true}
        isRequired={true}
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
        isRequired={true}
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
            isDisabled={!externalFilled}
            onClick={() => {
              // console.log("Here is the external data");
              // console.log(externalData);
              createClick();
            }}
            rightIcon={<IoIosCreate />}
          >
            Create
          </Button>
        </Grid>
      </Flex>
    </>
  );
};
