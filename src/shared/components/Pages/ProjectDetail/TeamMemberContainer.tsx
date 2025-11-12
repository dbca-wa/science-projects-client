import { Button, Flex, Text, useColorMode } from "@chakra-ui/react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { BsPlus } from "react-icons/bs";

interface TeamMemberContainerProps {
  id: UniqueIdentifier;
  children: ReactNode;
  title?: string;
  description?: string;
  onAddItem?: () => void;
}

export const TeamMemberContainer = ({
  id,
  children,
  onAddItem,
}: TeamMemberContainerProps) => {
  const { colorMode } = useColorMode();
  const { attributes, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: id,
      data: {
        type: "container",
      },
    });

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        "w-full h-full p-4 bg-gray-50 rounded-xl flex flex-col gap-y-4",
        isDragging && "opacity-50"
      )}
    >
      <Flex justifyContent={"space-between"}>
        <Text>Test</Text>
        <Button
          size={"sm"}
          onClick={onAddItem}
          leftIcon={<BsPlus />}
          bg={colorMode === "light" ? "green.500" : "green.600"}
          color={"white"}
          userSelect={"none"}
        >
          Invite Member
        </Button>
      </Flex>

      {children}
      <Button variant="ghost" onClick={onAddItem}>
        Add Item
      </Button>
    </div>
  );
};
