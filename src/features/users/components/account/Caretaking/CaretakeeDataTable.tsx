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

import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useMedia } from "react-use";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { ICaretakerSimpleUserData, IUserMe } from "@/shared/types";
import getAllIndirectCaretakees from "@/features/users/utils/getAllIndirectCaretakees";
import { FaArrowRight, FaEllipsisVertical } from "react-icons/fa6";
import { RemoveCaretakerModal } from "@/features/users/components/modals/RemoveCaretakerModal";
import { ChevronDown } from "lucide-react";
import { BsArrow90DegDown, BsArrow90DegRight } from "react-icons/bs";
import clsx from "clsx";
import { cn } from "@/shared/utils";

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
          <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={
                  row.original.image
                    ? row.original.image.startsWith("http")
                      ? row.original.image
                      : `${baseUrl}${row.original.image}`
                    : noImage
                }
                alt={`${row.original.display_first_name} ${row.original.display_last_name}`}
              />
              <AvatarFallback>
                {row.original.display_first_name?.charAt(0)}{row.original.display_last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "text-base font-semibold",
                colorMode === "light" ? "text-gray-800" : "text-gray-200"
              )}
            >
              {row.original.display_first_name} {row.original.display_last_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: () => (
          <Button
            className="w-full justify-end"
            variant="ghost"
          >
            Actions
          </Button>
        ),
        cell: ({ row }) => {
          const [isOpen, setIsOpen] = useState(false);
          const onOpen = () => setIsOpen(true);
          const onClose = () => setIsOpen(false);
          
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
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-black",
                        colorMode === "light" ? "bg-gray-100" : "bg-gray-300"
                      )}
                    >
                      <FaEllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log("Caretaker Obj", caretakerObj);
                        console.log(row.original);
                        onOpen();
                      }}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          );
        },
      },
    ];

    const subCaretakeesColumn: ColumnDef<CaretakeeWithChain> = {
      accessorKey: "subCaretakees",
      header: () => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-full justify-start"
                variant="ghost"
              >
                Sub-caretakees
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>You receive tasks from these users as well.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          {row.original.subCaretakees.length > 0 ? (
            row.original.subCaretakees.map((subCaretakee, index) => {
              const level = (subCaretakee as CaretakeeWithLevel).level;
              const nextItem = row.original.subCaretakees[
                index + 1
              ] as CaretakeeWithLevel;
              const isLastOfParent = !nextItem || nextItem.level < level;

              return (
                <div key={index} className="flex items-center relative">
                  <div
                    className="relative h-8 mr-3"
                    style={{ width: `${level * 24}px` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 scale-x-[-1] rotate-[-270deg] text-gray-300 text-base">
                      <BsArrow90DegDown />
                    </div>
                  </div>

                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        subCaretakee.image
                          ? subCaretakee.image.startsWith("http")
                            ? subCaretakee.image
                            : `${baseUrl}${subCaretakee.image}`
                          : noImage
                      }
                      alt={`${subCaretakee.display_first_name} ${subCaretakee.display_last_name}`}
                    />
                    <AvatarFallback>
                      {subCaretakee.display_first_name?.charAt(0)}{subCaretakee.display_last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm ml-2">
                    {subCaretakee.display_first_name}{" "}
                    {subCaretakee.display_last_name}
                  </span>

                  <span className="text-xs text-gray-500 ml-2">
                    (L{level})
                  </span>
                </div>
              );
            })
          ) : (
            <span className="text-sm text-gray-500 italic">
              No subcaretakees
            </span>
          )}
        </div>
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
            <p className="text-lg font-semibold">
              Caretakee Relationships
            </p>
            <p className="text-sm text-gray-500">
              These are the users you are caretaking for.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-lg font-semibold">
              Caretaking Relationships
            </p>
            <p className="text-sm text-gray-500">
              You are not caretaking for any users.
            </p>
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
