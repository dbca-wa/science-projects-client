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
            title={"Prince Issues Fixed"}
            kind="fix"
            description={
              "Prince does not yet support Debian 13. Base docker image downgraded to compatable version"
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
