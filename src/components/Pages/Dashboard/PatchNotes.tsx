import { Flex, List, Text } from "@chakra-ui/react";
import PatchNoteEntry from "./PatchNoteEntry";

const PatchNotes = () => {
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "Development v3";

  return (
    <div className="rounded-xl bg-gray-200 p-4">
      <Flex flexDir={"column"}>
        <Text
          my={2}
          fontSize={"16px"}
          fontWeight={"semibold"}
          // onClick={() => localStorage.removeItem("confettiCount")}
        >
          &#127881; SPMS {VERSION} Patch Notes &#127881;
        </Text>
        <List spacing={1} ml={2} userSelect={"none"}>
          <PatchNoteEntry
            title={"CSV Download & Options"}
            kind="update"
            description={
              "CSV Download now has two options - download all projects adn download this year's. Backend updated with extra column and title adjustments."
            }
          />
          <PatchNoteEntry
            title={"Patch Notes Moved"}
            kind="update"
            description={
              "To prevent clutter, patch notes have been moved to a separate page"
            }
          />
          <PatchNoteEntry
            title={"Dependencies"}
            kind="update"
            description={"Servers and dependencies updated."}
          />
        </List>
      </Flex>
    </div>
  );
};

export default PatchNotes;
