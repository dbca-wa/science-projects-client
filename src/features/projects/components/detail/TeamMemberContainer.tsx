import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { BsPlus } from "react-icons/bs";
import { ReactNode } from "react";

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
      <div className="flex justify-between">
        <p>Test</p>
        <Button
          size="sm"
          onClick={onAddItem}
          className={`text-white select-none ${
            colorMode === "light" ? "bg-green-500" : "bg-green-600"
          }`}
        >
          <BsPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {children}
      <Button variant="ghost" onClick={onAddItem}>
        Add Item
      </Button>
    </div>
  );
};
