import { IDivision, IEmailListUser } from "@/types";
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
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { IProjectData, ProjectRoles } from "@/types";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

import { useProjectSearchContext } from "@/lib/hooks/helper/ProjectSearchContext";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDownIcon,
  DeleteIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaEnvelope, FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { AddIcon } from "@chakra-ui/icons";
import AddRemoveUserFromEmailListModal from "./AddRemoveUserFromEmailListModal";

export type EmailListColumnTypes = "name" | "slug" | "directorate_email_list";

export type DisabledColumnsMap = {
  [cType in EmailListColumnTypes]?: boolean;
};

type EnabledColumns<T extends DisabledColumnsMap> = {
  [K in keyof T]: T[K] extends true ? never : K;
}[keyof T];

export interface DivisionTableDataProps {
  data: IDivision[];
  refetchData: () => void;
  defaultSorting: EmailListColumnTypes;
  disabledColumns?: Partial<Record<EmailListColumnTypes, boolean>>;
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    width?: string;
  }
}

const DivisionalEmailListDataTable = ({
  data,
  refetchData,
  defaultSorting,
  disabledColumns = {},
}: DivisionTableDataProps) => {
  const { colorMode } = useColorMode();

  const columnDefs: ColumnDef<IDivision>[] = [
    // Name
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }
        return (
          <Button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex w-full justify-start"
            rightIcon={sortIcon}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Name
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalDivisionName = row?.original?.name || "Unset";
        return (
          <Box className="text-start align-middle font-medium">
            <Text className="whitespace-normal break-words pl-4">
              {originalDivisionName}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const divA = rowA?.original?.name || "Unset";
        const divB = rowB?.original?.name || "Unset";
        const a = divA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = divB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);
      },
      meta: { width: "30%" },
    },
    // Slug
    {
      accessorKey: "slug",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }

        return (
          <Button
            bg={"transparent"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex w-full justify-start"
            rightIcon={sortIcon}
            justifyContent={"flex-start"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Slug
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalDivisionSlug = row?.original?.slug || "Unset";
        return (
          <Box className="flex w-full justify-start pl-4">
            <Text className="whitespace-normal break-words">
              {originalDivisionSlug}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalSlugDataA = rowA.original.slug;
        const originalSlugDataB = rowB.original.slug;
        const a = originalSlugDataA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = originalSlugDataB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original.slug;
        function matchHTMLTitle(
          htmlContent: string,
          searchText: string,
        ): boolean {
          return htmlContent.toLowerCase().includes(searchText.toLowerCase());
        }
        return matchHTMLTitle(cellValue, filterValue);
      },
      meta: { width: "20%" },
    },
    // Email List
    {
      accessorKey: "directorate_email_list",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }
        return (
          <Button
            className="flex w-full justify-center"
            leftIcon={<FaEnvelope />}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white", cursor: "default" }
                : { bg: "blue.50", color: "black", cursor: "default" }
            }
          >
            Directorate Email List
          </Button>
        );
      },
      cell: ({ row }) => {
        const listData: IEmailListUser[] | null = row.getValue(
          "directorate_email_list",
        );

        const { isOpen, onOpen, onClose } = useDisclosure();
        const {
          isOpen: isAddRemoveUserModalOpen,
          onOpen: onAddRemoveUserModalOpen,
          onClose: onAddRemoveUserModalClose,
        } = useDisclosure();

        const divisionPk = row.original.pk;

        const handleAddRemoveUser = () => {
          onClose();
          onAddRemoveUserModalOpen();
        };

        // const handleAddUser = () => {
        //   // Add your logic for adding a user to the email list
        //   console.log("Adding user to division:", divisionPk);
        //   //   setAction("add");
        //   onClose();
        //   onAddRemoveUserModalOpen();
        // };

        // const handleRemoveUser = () => {
        //   // Add your logic for removing a user from the email list
        //   console.log("Removing user from division:", divisionPk);
        //   //   setAction("remove");

        //   onClose();
        //   onAddRemoveUserModalOpen();
        // };

        // const [action, setAction] = useState<"add" | "remove">("add");
        // useEffect(() => {
        //   console.log(listData);
        // }, [listData]);
        return (
          <>
            <AddRemoveUserFromEmailListModal
              isOpen={isAddRemoveUserModalOpen}
              onClose={onAddRemoveUserModalClose}
              refetch={refetchData}
              divisionPk={divisionPk}
              //   action={action}
              currentList={listData}
            />
            <Flex className="flex w-full justify-between">
              <Box className="max-w-full overflow-hidden text-start align-middle font-medium">
                {Array.isArray(listData) && listData.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {listData.map((u) => (
                      <li
                        key={u.email}
                        className="p-0xw m-0 mb-2 justify-start whitespace-normal break-words text-black"
                      >
                        {`${u.email}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text color="gray.500">No users</Text>
                )}
              </Box>
              <Box className="flex items-center justify-end">
                <Menu isOpen={isOpen} onClose={onClose}>
                  <MenuButton
                    as={Button}
                    size="sm"
                    variant="ghost"
                    onClick={onOpen}
                  >
                    <MoreVerticalIcon size={16} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      icon={<PencilIcon size={12} />}
                      onClick={handleAddRemoveUser}
                    >
                      Adjust List
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Flex>
          </>
        );
      },
      meta: { width: "50%" },
    },
  ];

  // Fixed column filter with proper null check
  const columns = columnDefs.filter((column) => {
    // Use type guard to check if accessorKey exists on this column
    const hasAccessorKey = "accessorKey" in column;

    // Safely extract the accessorKey if it exists
    const accessorKeyValue = hasAccessorKey
      ? (column.accessorKey as string | undefined)
      : undefined;

    return (
      !accessorKeyValue ||
      !disabledColumns[accessorKeyValue as EmailListColumnTypes]
    );
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: defaultSorting,
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
  });

  const twRowClassLight = "hover:cursor-pointer hover:bg-blue-50";
  const twRowClassDark = "hover:cursor-pointer hover:bg-inherit";

  return (
    <div className="rounded-b-md border">
      <div className="w-full">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="table-header-row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.column.columnDef.meta?.width || "auto",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    colorMode === "light" ? twRowClassLight : twRowClassDark
                  }
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.columnDef.meta?.width || "auto",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      className="overflow-hidden text-wrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DivisionalEmailListDataTable;
