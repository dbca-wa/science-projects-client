import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
import { useMedia } from "react-use";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useApiEndpoint from "@/shared/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/helper/useNoImage";
import type { ICaretakerSimpleUserData, IUserMe } from "@/shared/types/index.d";
import getAllIndirectCaretakees from "@/shared/hooks/helper/getAllIndirectCaretakees";
import { FaArrowRight, FaEllipsisVertical } from "react-icons/fa6";
import { RemoveCaretakerModal } from "@/shared/components/Modals/Caretakers/RemoveCaretakerModal";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { BsArrow90DegDown, BsArrow90DegRight } from "react-icons/bs";
import clsx from "clsx";

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

    const isDesktop = useMedia("(min-width: 1314px)");

    // Transform data to include subcaretakee chains
    const data: CaretakeeWithChain[] = useMemo(() => {
      return myData.caretaking_for.map((caretakee) => ({
        ...caretakee,
        subCaretakees: getCaretakeeChain(caretakee),
      }));
    }, [myData.caretaking_for]);

    const baseColumns: ColumnDef<CaretakeeWithChain>[] = [
      {
        accessorKey: "user",
        header: ({ column }) => (
          <Button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
              {row.original.display_first_name} {row.original.display_last_name}
            </Text>
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
        cell: ({ row }) => {
          const { isOpen, onOpen, onClose } = useDisclosure();
          const caretakerObj = {
            caretaker_obj_id: row.original.caretaker_obj_id,
            id: row.original.pk,
            user: {
              pk: row.original.pk,
              display_first_name: row.original.display_first_name,
              display_last_name: row.original.display_last_name,
              image: row.original.image,
            },
            caretaker: {
              pk: myData?.pk,
              display_first_name: myData?.display_first_name,
              display_last_name: myData?.display_last_name,
              image: myData?.image,
            },
            end_date: null,
            reason: null,
            notes: null,
          };

          return (
            <>
              <RemoveCaretakerModal
                isOpen={isOpen}
                onClose={onClose}
                caretakerObject={caretakerObj}
                refetch={refetchCaretakerData}
              />
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
                    <MenuItem
                      onClick={() => {
                        console.log("Caretaker Obj", caretakerObj);
                        console.log(row.original);
                        onOpen();
                      }}
                    >
                      Remove
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </>
          );
        },
      },
    ];

    const subCaretakeesColumn: ColumnDef<CaretakeeWithChain> = {
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
              const nextItem = row.original.subCaretakees[
                index + 1
              ] as CaretakeeWithLevel;
              const isLastOfParent = !nextItem || nextItem.level < level;

              return (
                <Flex key={index} align="center" position="relative">
                  <Box
                    width={`${level * 24}px`}
                    position="relative"
                    height="32px"
                    marginRight="12px"
                  >
                    <Box
                      position="absolute"
                      right="0"
                      top="50%"
                      transform="translateY(-50%) scale(-1) rotate(-270deg)"
                      color="gray.300"
                      fontSize="16px"
                    >
                      <BsArrow90DegDown />
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
    };

    const columns = useMemo(() => {
      if (isDesktop) {
        // Insert subCaretakees column before actions
        return [
          ...baseColumns.slice(0, 1),
          isDesktop && subCaretakeesColumn,
          ...baseColumns.slice(1),
        ];
      }
      return baseColumns;
    }, [isDesktop, colorMode, baseUrl, noImage]);

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
        {myData.caretaking_for.length > 0 ? (
          <div className="p-4">
            <Text fontSize="lg" fontWeight="semibold">
              Caretakee Relationships
            </Text>
            <Text fontSize="sm" color="gray.500">
              These are the users you are caretaking for.
            </Text>
          </div>
        ) : (
          <div className="p-4">
            <Text fontSize="lg" fontWeight="semibold">
              Caretaking Relationships
            </Text>
            <Text fontSize="sm" color="gray.500">
              You are not caretaking for any users.
            </Text>
          </div>
        )}

        <Table>
          <TableHeader
            className={clsx(
              "border-t",
              colorMode === "light" ? "border-gray-200" : "border-gray-800",
            )}
          >
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
