import { Button, Flex, Text, useColorMode, useDisclosure } from "@chakra-ui/react";
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, UniqueIdentifier, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners, DragMoveEvent } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal";
import { BsPlus } from "react-icons/bs";


interface TeamMemberContainerProps {
    id: UniqueIdentifier;
    children: React.ReactNode;
    title?: string;
    description?: string;
    onAddItem?: () => void;
}

export const TeamMemberContainer = ({ id,
    children,
    title,
    description,
    onAddItem
}: TeamMemberContainerProps) => {

    const { colorMode } = useColorMode();
    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: 'container',
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
                'w-full h-full p-4 bg-gray-50 rounded-xl flex flex-col gap-y-4',
                isDragging && 'opacity-50',
            )}
        >
            {/* <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-1">
                    <h1 className="text-gray-800 text-xl">{title}</h1>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
                <button
                    className="border p-2 text-xs rounded-xl shadow-lg hover:shadow-xl"
                    {...listeners}
                >
                    Drag Handle
                </button>
            </div>
 */}

            <Flex
                justifyContent={"space-between"}
            >
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

}