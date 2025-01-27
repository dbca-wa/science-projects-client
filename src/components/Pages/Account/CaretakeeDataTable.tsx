import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { ICaretakerSimpleUserData, IUserMe } from "@/types";
import getAllIndirectCaretakees from "@/lib/hooks/helper/getAllIndirectCaretakees";
import { FaArrowRight, FaEllipsisVertical } from "react-icons/fa6";
import { RemoveCaretakerModal } from "@/components/Modals/Caretakers/RemoveCaretakerModal";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { BsArrow90DegDown, BsArrow90DegRight } from "react-icons/bs";

interface CaretakerTableData extends ICaretakerSimpleUserData {
  type: "direct" | "indirect";
}

interface CaretakerDataTableProps {
  myData: IUserMe;
  refetchCaretakerData: () => void;
}

interface CaretakeeWithChain extends ICaretakerSimpleUserData {
  subCaretakees: ICaretakerSimpleUserData[];
}

interface CaretakeeWithLevel extends ICaretakerSimpleUserData {
  level: number;
}
// Modify the chain function to track levels
const getCaretakeeChain = (
  caretakee: ICaretakerSimpleUserData,
  level: number = 1,
  visited: Set<number> = new Set(),
): CaretakeeWithLevel[] => {
  if (!caretakee?.caretaking_for?.length || visited.has(caretakee.pk)) {
    return [];
  }

  visited.add(caretakee.pk);
  const chain: CaretakeeWithLevel[] = [];

  for (const subCaretakee of caretakee.caretaking_for) {
    chain.push({ ...subCaretakee, level });
    chain.push(...getCaretakeeChain(subCaretakee, level + 1, visited));
  }

  return chain;
};

// Helper function to find the caretaker chain
const findCaretakerChain = (
  targetUser: ICaretakerSimpleUserData,
  myPk: number,
  chain: ICaretakerSimpleUserData[] = [],
): ICaretakerSimpleUserData[] | null => {
  // If we've reached a user with no caretakers, or we've gone too deep
  if (!targetUser.caretakers?.length || chain.length > 10) return null;

  // Check each caretaker
  for (const caretaker of targetUser.caretakers) {
    // If we found the original user (me), we've completed the chain
    if (caretaker.pk === myPk) {
      return chain;
    }

    // Try this caretaker's path
    const newChain = [...chain, caretaker];
    const result = findCaretakerChain(caretaker, myPk, newChain);
    if (result) return result;
  }

  return null;
};

export const CaretakeeDataTable = React.memo(
  ({ myData, refetchCaretakerData }: CaretakerDataTableProps) => {
    const { colorMode } = useColorMode();
    const baseUrl = useApiEndpoint();
    const noImage = useNoImage();
    const [sorting, setSorting] = useState<SortingState>([]);

    // Transform data to include subcaretakee chains
    const data: CaretakeeWithChain[] = useMemo(() => {
      return myData.caretaking_for.map((caretakee) => ({
        ...caretakee,
        subCaretakees: getCaretakeeChain(caretakee),
      }));
    }, [myData.caretaking_for]);

    const columns = useMemo<ColumnDef<CaretakeeWithChain>[]>(
      () => [
        {
          accessorKey: "user",
          header: ({ column }) => (
            <Button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex w-full justify-start text-left"
              variant="ghost"
              leftIcon={
                column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUpDown className="h-4 w-4" />
                )
              }
            >
              Direct Caretakee
            </Button>
          ),
          cell: ({ row }) => (
            <Flex className="items-center gap-4">
              <Avatar
                size="md"
                name={`${row.original.display_first_name} ${row.original.display_last_name}`}
                src={
                  row.original.image
                    ? row.original.image.startsWith("http")
                      ? row.original.image
                      : `${baseUrl}${row.original.image}`
                    : noImage
                }
              />
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={colorMode === "light" ? "gray.800" : "gray.200"}
              >
                {row.original.display_first_name}{" "}
                {row.original.display_last_name}
              </Text>
            </Flex>
          ),
        },
        {
          accessorKey: "subCaretakees",
          header: () => (
            <Tooltip
              label="You receive tasks from these users as well."
              aria-label="You receive tasks from these users as well."
            >
              <Button
                className="w-full justify-start"
                variant={"ghost"}
                bg={"transparent"}
                _hover={
                  colorMode === "dark"
                    ? { bg: "transparent", color: "white", cursor: "default" }
                    : { bg: "transparent", color: "black", cursor: "default" }
                }
              >
                Sub-caretakees
              </Button>
            </Tooltip>
          ),
          cell: ({ row }) => (
            <Flex direction="column" gap={2}>
              {row.original.subCaretakees.length > 0 ? (
                row.original.subCaretakees.map((subCaretakee, index) => {
                  const level = (subCaretakee as CaretakeeWithLevel).level;

                  console.log({
                    index,
                    level,
                    name: `${subCaretakee.display_first_name} ${subCaretakee.display_last_name}`,
                  });

                  const nextItem = row.original.subCaretakees[
                    index + 1
                  ] as CaretakeeWithLevel;
                  const isLastOfParent = !nextItem || nextItem.level < level;

                  const isFirstOfLevel =
                    index === 0 ||
                    (subCaretakee as CaretakeeWithLevel).level !==
                      (
                        row.original.subCaretakees[
                          index - 1
                        ] as CaretakeeWithLevel
                      ).level;

                  return (
                    <Flex key={index} align="center" position="relative">
                      <Box
                        width={`${level * 24}px`}
                        position="relative"
                        height="32px"
                        marginRight="12px"
                      >
                        {/* Horizontal line to current item */}
                        {/* <Box
                          position="absolute"
                          right="0"
                          top="50%"
                          width="12px"
                          height="2px"
                          bg="gray.300"
                        /> */}

                        <Box
                          position="absolute"
                          right="0"
                          top="50%"
                          transform="translateY(-50%) scale(-1) rotate(-270deg)"
                          // translateY={-50}
                          color="gray.300"
                          fontSize="16px" // Adjust size to match design
                        >
                          <BsArrow90DegDown />{" "}
                          {/* Use your desired arrow icon */}
                        </Box>
                      </Box>

                      <Avatar
                        size="sm"
                        name={`${subCaretakee.display_first_name} ${subCaretakee.display_last_name}`}
                        src={
                          subCaretakee.image
                            ? subCaretakee.image.startsWith("http")
                              ? subCaretakee.image
                              : `${baseUrl}${subCaretakee.image}`
                            : noImage
                        }
                      />
                      <Text fontSize="sm" ml={2}>
                        {subCaretakee.display_first_name}{" "}
                        {subCaretakee.display_last_name}
                      </Text>

                      <Text fontSize="xs" color="gray.500" ml={2}>
                        (L{level})
                      </Text>
                    </Flex>
                  );
                })
              ) : (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  No subcaretakees
                </Text>
              )}
            </Flex>
          ),
        },
        {
          accessorKey: "actions",
          header: () => (
            <Button
              className="w-full justify-end"
              variant={"ghost"}
              bg={"transparent"}
              _hover={
                colorMode === "dark"
                  ? { bg: "transparent", color: "white", cursor: "default" }
                  : { bg: "transparent", color: "black", cursor: "default" }
              }
            >
              Actions
            </Button>
          ),
          cell: ({ row }) => (
            <Box className="flex justify-end">
              <Menu>
                <MenuButton
                  as={Button}
                  color="black"
                  background={colorMode === "light" ? "gray.100" : "gray.300"}
                >
                  <FaEllipsisVertical />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => {}}>Remove</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          ),
        },
      ],
      [colorMode, baseUrl, noImage],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      state: { sorting },
    });

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    colorMode === "light"
                      ? "hover:bg-blue-50"
                      : "hover:bg-gray-800"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No caretaker relationships found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
);

CaretakeeDataTable.displayName = "CaretakeeDataTable";
