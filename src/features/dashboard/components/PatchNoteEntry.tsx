import { ListIcon, ListItem, Text } from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";

const PatchNoteEntry = ({
  title,
  kind,
  description,
}: {
  title: string;
  kind: "feature" | "update" | "fix";
  description: string;
}) => {
  return (
    <ListItem fontSize={"small"} textIndent={"-21px"} marginLeft={"21px"}>
      <ListIcon as={MdCheckCircle} color="green.500" />
      <Text as="span" fontWeight="semibold">
        {`${kind[0].toUpperCase()}${kind.slice(1)}: ${title}`}
      </Text>
      <Text
        display="block"
        mt={0}
        ml="21px"
        sx={{
          textIndent: "0",
          marginLeft: "0",
        }}
      >
        {description}
      </Text>
    </ListItem>
  );
};

export default PatchNoteEntry;
