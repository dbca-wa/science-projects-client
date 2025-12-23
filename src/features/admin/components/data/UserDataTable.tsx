import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";

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
            className={`flex w-full text-left justify-start bg-transparent ${
              colorMode === "dark"
                ? "hover:bg-blue-400 hover:text-white"
                : "hover:bg-blue-50 hover:text-black"
            }`}
          >
            Name
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalImageData = row?.original?.image;
        return (
          <div className="text-center font-medium flex items-center pl-4">
            <img
              className="object-cover w-[50px] h-[50px] rounded-full"
              src={
                originalImageData !== null && originalImageData !== undefined
                  ? `${baseUrl}${originalImageData}`
                  : noImage
              }
              alt="User"
            />
            <p className="px-4">{row.original.name}</p>
          </div>
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
            className={`w-full text-center bg-transparent ${
              colorMode === "dark"
                ? "hover:bg-blue-400 hover:text-white"
                : "hover:bg-blue-50 hover:text-black"
            }`}
          >
            Email
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-center align-middle font-medium">
            <p>{row?.original?.email}</p>
          </div>
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
            className={`bg-transparent w-full text-center justify-center ${
              colorMode === "dark"
                ? "hover:bg-blue-400 hover:text-white"
                : "hover:bg-blue-50 hover:text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Is Staff
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const staffData = row?.original?.is_staff;
        return (
          <div className="flex justify-center">
            {staffData === true ? (
              <FcApproval size={"30px"} />
            ) : (
              <FcCancel size={"30px"} />
            )}
          </div>
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
            className={`w-full text-center bg-transparent ${
              colorMode === "dark"
                ? "hover:bg-blue-400 hover:text-white"
                : "hover:bg-blue-50 hover:text-black"
            }`}
          >
            Is Active
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const isActiveData = row?.original?.is_active;
        return (
          <div className="flex justify-center">
            {isActiveData === true ? (
              <FcApproval size={"30px"} />
            ) : (
              <FcCancel size={"30px"} />
            )}
          </div>
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
                {noDataString}
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
  const [isUserOpen, setIsUserOpen] = useState(false);
  const onUserOpen = () => setIsUserOpen(true);
  const onUserClose = () => setIsUserOpen(false);

  const drawerFunction = () => {
    // console.log(`${first_name} clicked`);
    onUserOpen();
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>User Profile</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <UserProfile
              pk={row?.original?.pk}
              branches={[]}
              businessAreas={[]}
            />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
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
