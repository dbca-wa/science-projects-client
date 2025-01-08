// Tab data for Project External Project info on the creation page.

import { AffiliationCreateSearchDropdown } from "@/components/Navigation/AffiliationCreateSearchDropdown";
import { IAffiliation } from "@/types";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Icon,
  InputGroup,
  InputLeftAddon,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { HiAcademicCap } from "react-icons/hi";
import { IoIosCreate } from "react-icons/io";
import { ICreateProjectStudentDetails } from "../../../lib/api/api";
import "../../../styles/modalscrollbar.css";

interface IProjectStudentProps {
  studentFilled: boolean;
  setStudentFilled: React.Dispatch<React.SetStateAction<boolean>>;
  studentData: ICreateProjectStudentDetails;
  setStudentData: React.Dispatch<
    React.SetStateAction<ICreateProjectStudentDetails>
  >;
  // (data) => void;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
}

export const ProjectStudentSection = ({
  backClick,
  createClick,
  studentFilled,
  setStudentFilled,
  studentData,
  setStudentData,
}: IProjectStudentProps) => {
  const { colorMode } = useColorMode();

  const [hoveredTitle, setHoveredTitle] = useState(false);

  const titleBorderColor = `${
    colorMode === "light"
      ? hoveredTitle
        ? "blackAlpha.300"
        : "blackAlpha.200"
      : hoveredTitle
        ? "whiteAlpha.400"
        : "whiteAlpha.300"
  }`;

  const [level, setLevel] = useState<string>("");
  const [organisation, setOrganisation] = useState<string>("");

  const [collaboratingPartnersArray, setCollaboratingPartnersArray] = useState<
    IAffiliation[] | null
  >([]);

  useEffect(() => {
    console.log(collaboratingPartnersArray);
    console.log(organisation);
  }, [collaboratingPartnersArray, organisation]);
  const addCollaboratingPartnersPkToArray = (affiliation: IAffiliation) => {
    setOrganisation((prevString) => {
      let updatedString = prevString.trim(); // Remove any leading or trailing spaces

      // Add a comma and a space if not already present
      if (updatedString && !/,\s*$/.test(updatedString)) {
        updatedString += ", ";
      }

      // Append affiliation name
      updatedString += affiliation.name.trim();

      // Check if the first two characters are a space and comma, remove them
      if (updatedString?.startsWith(", ")) {
        updatedString = updatedString.substring(2);
      }

      return updatedString;
    });
    setCollaboratingPartnersArray((prev) => [...prev, affiliation]);
  };

  const removeCollaboratingPartnersPkFromArray = (
    affiliation: IAffiliation,
  ) => {
    console.log(affiliation);
    setOrganisation((prevString) => {
      const regex = new RegExp(`.{0,2}${affiliation.name.trim()}\\s*`, "g");
      let updatedString = prevString.replace(regex, "").trim();
      if (updatedString?.startsWith(", ")) {
        updatedString = updatedString.substring(2);
      }
      return updatedString;
    });

    setCollaboratingPartnersArray((prev) =>
      prev.filter((item) => item !== affiliation),
    );
  };

  const clearCollaboratingPartnersPkArray = () => {
    setOrganisation("");
    setCollaboratingPartnersArray([]);
  };

  useEffect(() => {
    setStudentData({
      level: level,
      organisation: organisation,
    });
  }, [level, organisation]);

  useEffect(() => {
    if (organisation.length > 0 && level.length > 0) {
      // console.log(studentData);
      setStudentFilled(true);
    } else {
      setStudentFilled(false);
    }
  }, [studentData, level, organisation, setStudentData]);

  return (
    <>
      {/* <UnboundStatefulEditor
        title="Organisation"
        placeholder="Enter the academic organisation..."
        helperText={"The academic organisation of the student"}
        showToolbar={false}
        showTitle={true}
        isRequired={true}
        value={organisation}
        setValueFunction={setOrganisation}
        setValueAsPlainText={true}
      /> */}

      <AffiliationCreateSearchDropdown
        autoFocus
        isRequired
        isEditable
        array={collaboratingPartnersArray}
        arrayAddFunction={addCollaboratingPartnersPkToArray}
        arrayRemoveFunction={removeCollaboratingPartnersPkFromArray}
        arrayClearFunction={clearCollaboratingPartnersPkArray}
        label="Organisation"
        placeholder="Enter the academic organisation..."
        helperText="The academic organisation of the student"
      />
      {organisation}

      <FormControl pb={6} isRequired userSelect={"none"}>
        <FormLabel
          onMouseEnter={() => setHoveredTitle(true)}
          onMouseLeave={() => setHoveredTitle(false)}
        >
          Level
        </FormLabel>
        <InputGroup>
          <InputLeftAddon
            left={0}
            bg={colorMode === "light" ? "gray.100" : "whiteAlpha.300"}
            px={4}
            zIndex={1}
            borderColor={titleBorderColor}
            borderTopRightRadius={"none"}
            borderBottomRightRadius={"none"}
            borderRight={"none"}
            // boxSize={10}
          >
            <Icon as={HiAcademicCap} boxSize={5} />
          </InputLeftAddon>

          <Select
            placeholder={"Select a level"}
            borderLeft={"none"}
            borderTopLeftRadius={"none"}
            borderBottomLeftRadius={"none"}
            pl={"2px"}
            borderLeftColor={"transparent"}
            onMouseEnter={() => setHoveredTitle(true)}
            onMouseLeave={() => setHoveredTitle(false)}
            // {...register("title", {
            //     value: data?.title,
            // })}
            onChange={(e) => {
              setLevel(e.target.value);
            }}
            value={level}
          >
            <option value="phd">PhD</option>
            <option value="msc">MSc</option>
            <option value="honours">BSc Honours</option>
            <option value="fourth_year">Fourth Year</option>
            <option value="third_year">Third Year</option>
            <option value="undergrad">Undergradate</option>
          </Select>
        </InputGroup>

        <FormHelperText>
          The level of the student and the project
        </FormHelperText>
      </FormControl>
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
            isDisabled={!studentFilled}
            onClick={() => {
              // console.log("Here is the student data");
              // console.log(studentData);
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
