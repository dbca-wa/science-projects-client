import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Image,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { UserProfile } from "@/features/users/components/UserProfile";
import { IUserDataTableEntry } from "./EmailLists";
import { FcApproval, FcCancel } from "react-icons/fc";

export type UserColumnTypes =
  | "email"
  | "image"
  | "name"
  | "pk"
  | "is_staff"
  | "is_active";

export type DisabledColumnsMap = {
  [cType in UserColumnTypes]?: boolean;
} & {
  name: false; // Ensure "title" cannot be disabled/always set to false
};

type EnabledColumns<T extends DisabledColumnsMap> = {
  [K in keyof T]: T[K] extends true ? never : K;
}[keyof T];

export interface UserDataTableProps {
  userData: IUserDataTableEntry[];
  defaultSorting: EnabledColumns<DisabledColumnsMap>;
  disabledColumns: DisabledColumnsMap;
  noDataString: string;
}

const twRowClassLight = "hover:cursor-pointer hover:bg-blue-50";
const twRowClassDark = "hover:cursor-pointer hover:bg-inherit";

export const UserDataTable = ({
  userData,
  defaultSorting,
  disabledColumns,
  noDataString,
}: UserDataTableProps) => {
  const { colorMode } = useColorMode();
  // console.log(userData);
  const baseUrl = useApiEndpoint();
  const noImage = useNoImage();
  console.log("DATA:\n");
  console.log(userData);

  const columnDefs: ColumnDef<IUserDataTableEntry>[] = [
    // name & image
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
            className="flex w-full text-left"
            justifyContent={"flex-start"}
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
        const originalImageData = row?.original?.image;
        return (
          <Flex
            className="text-center font-medium"
            // justifyContent={"center"}
            alignItems={"center"}
            pl={4}
          >
            <Image
              objectFit={"cover"}
              src={
                originalImageData !== null && originalImageData !== undefined
                  ? `${baseUrl}${originalImageData}`
                  : noImage
              }
              boxSize={"50px"}
              rounded={"full"}
            />
            <Text px={4}>{row.original.name}</Text>
          </Flex>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA?.original?.name?.trim();
        const nameB = rowB?.original?.name?.trim();
        return nameA.localeCompare(nameB);
      },
    },
    // email
    {
      accessorKey: "email",
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
            className="w-full text-center"
            rightIcon={sortIcon}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Email
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <Box className="text-center align-middle font-medium">
            <Text>{row?.original?.email}</Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const emailA = rowA?.original?.email?.trim();
        const emailB = rowB?.original?.email?.trim();
        return emailA.localeCompare(emailB);
      },
    },
    // is_staff
    {
      accessorKey: "is_staff",
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
            className="w-full text-center"
            rightIcon={sortIcon}
            justifyContent={"center"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Is Staff
          </Button>
        );
      },
      cell: ({ row }) => {
        const staffData = row?.original?.is_staff;
        return (
          <Center>
            {staffData === true ? (
              <FcApproval size={"30px"} />
            ) : (
              <FcCancel size={"30px"} />
            )}
          </Center>
        );
      },
      sortingFn: (rowA, rowB) => {
        const staffA = rowA?.original?.is_staff ? 1 : 0;
        const staffB = rowB?.original?.is_staff ? 1 : 0;
        return staffA - staffB;
      },
    },
    // is_active
    {
      accessorKey: "is_active",
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
            className="w-full text-center"
            rightIcon={sortIcon}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Is Active
          </Button>
        );
      },
      cell: ({ row }) => {
        const isActiveData = row?.original?.is_active;
        return (
          <Center>
            {isActiveData === true ? (
              <FcApproval size={"30px"} />
            ) : (
              <FcCancel size={"30px"} />
            )}
          </Center>
        );
      },
      sortingFn: (rowA, rowB) => {
        const activeA = rowA.original?.is_active ? 1 : 0;
        const activeB = rowB.original?.is_active ? 1 : 0;
        return activeA - activeB;
      },
    },
  ];

  const columns = columnDefs.filter(
    (column) =>
      !disabledColumns[(column as any).accessorKey as UserColumnTypes],
  );

  // type columnTypes = "kind" | "title" | "status" | "image" | "role" | "created_at";

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: defaultSorting,
      desc: false,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // created_at: false,
  });

  const data = userData;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div className="rounded-b-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="table-header-row">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => <UserTableRow key={row.id} row={row} />)
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                {/* <Text mt={4} mx={2}> */}
                {noDataString}
                {/* </Text> */}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

interface UserTableRowProps {
  row: Row<IUserDataTableEntry>;
}

const UserTableRow = ({ row }: UserTableRowProps) => {
  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();

  const drawerFunction = () => {
    // console.log(`${first_name} clicked`);
    onUserOpen();
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Drawer
        isOpen={isUserOpen}
        placement="right"
        onClose={onUserClose}
        size={"lg"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <UserProfile
              pk={row?.original?.pk}
              branches={[]}
              businessAreas={[]}
            />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
      <TableRow
        key={row.id}
        className={colorMode === "light" ? twRowClassLight : twRowClassDark}
        data-state={row.getIsSelected() && "selected"}
        onClick={drawerFunction}
        // onClick={(e) =>
        //     drawerFunction(
        //     e,
        //     row?.original?.id ? row?.original?.id : row?.original?.pk,
        //   )
        // }
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {/* <UserProfile pk={row?.original?.id ? row?.original?.id : row?.original?.pk}                    
            /> */}
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};
