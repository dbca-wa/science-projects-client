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
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";

import { useProjectSearchContext } from "@/lib/hooks/helper/ProjectSearchContext";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export type ProjectColumnTypes =
  | "business_area"
  | "created_at"
  | "kind"
  | "title"
  | "status"
  | "image"
  | "role";

export type DisabledColumnsMap = {
  [cType in ProjectColumnTypes]?: boolean;
} & {
  title: false; // Ensure "title" cannot be disabled/always set to false
};

type EnabledColumns<T extends DisabledColumnsMap> = {
  [K in keyof T]: T[K] extends true ? never : K;
}[keyof T];

export interface ProjectDataTableProps {
  projectData: IProjectData[];
  defaultSorting: EnabledColumns<DisabledColumnsMap>;
  disabledColumns: DisabledColumnsMap;
  noDataString: string;
  filters?: boolean;
}

const returnHTMLTitle = (titleData) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = titleData;
  const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
  if (tag) {
    return tag.textContent;
  } else {
    // console.log(wrapper.innerHTML);
    return wrapper.innerHTML;
  }
};

export const UserProjectsDataTable = ({
  projectData,
  defaultSorting,
  disabledColumns,
  noDataString,
  filters,
}: ProjectDataTableProps) => {
  const [hideInactive, setHideInactive] = useState(true);

  const { colorMode } = useColorMode();
  // console.log(projectData);
  const baseUrl = useApiEndpoint();
  const noImage = useNoImage();
  const { isOnProjectsPage } = useProjectSearchContext();
  const navigate = useNavigate();
  const goToProject = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
  ) => {
    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else {
      if (isOnProjectsPage) {
        if (e.ctrlKey || e.metaKey) {
          window.open(`${pk}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`${pk}`);
        }
      } else {
        if (e.ctrlKey || e.metaKey) {
          window.open(`/projects/${pk}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`/projects/${pk}`);
        }
      }
    }
  };
  const formatDate = (dateData: Date) => {
    const inputDate = new Date(dateData);
    const getOrdinalIndicator = (day: number) => {
      if (day > 10 && day < 20) {
        return "th";
      } else {
        const lastDigit = day % 10;
        switch (lastDigit) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      }
    };

    const dateOptions = {
      year: "numeric" as const,
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "Australia/Perth",
    };

    const day = inputDate.getDate();
    const ordinalIndicator = getOrdinalIndicator(day);
    // eslint-disable-next-line
    //@ts-ignore
    let formattedDate = inputDate.toLocaleString("en-AU", dateOptions);
    formattedDate = formattedDate.replace(
      new RegExp(`\\b${day}\\b`),
      `${day}${ordinalIndicator}`,
    );
    formattedDate = formattedDate.replace(
      /\b(\d{1,2}:\d{1,2})\s*([ap]m)\b/gi,
      (match, time, meridiem) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour);
        const suffix = meridiem.toUpperCase();
        const formattedHour =
          hourInt === 0 || hourInt === 12 ? 12 : hourInt % 12;
        return `${formattedHour}:${minute}${suffix}`;
      },
    );
    formattedDate = formattedDate.replace("at", "@");

    const month = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(inputDate);
    const monthIndex = formattedDate.indexOf(month);
    formattedDate =
      formattedDate.slice(0, monthIndex + month?.length) +
      "," +
      formattedDate.slice(monthIndex + month?.length);

    return formattedDate;
  };
  type statuses =
    | "pending"
    | "closure_requested"
    | "updating"
    | "completed"
    | "new"
    | "active"
    | "final_update"
    | "terminated"
    | "suspended";

  const statusOrder = [
    "final_update",
    "updating",
    "active",
    "pending",
    "new",
    "closure_requested",
    "suspended",
    "completed",
    "terminated",
  ];
  const statusMapping = {
    pending: "Pending Project Plan",
    closure_requested: "Closure Requested",
    updating: "Update Requested",
    completed: "Completed",
    new: "New",
    active: "Active (Approved)",
    final_update: "Final Update Requested",
    terminated: "Terminated and Closed",
    suspended: "Suspended",
  };

  const roleOrder = [
    "supervising",
    "research",
    "technical",
    "externalcol",
    "externalpeer",
    "academicsuper",
    "student",
    "consulted",
    "group",
  ];

  const roleDict = {
    supervising: {
      color: "orange",
      string: "Leader",
    },
    research: {
      color: "green",
      string: "Science Support",
    },
    technical: {
      color: "brown",
      string: "Technical Support",
    },
    academicsuper: {
      color: "blue",
      string: "Academic Supervisor",
    },
    student: {
      color: "blue",
      string: "Supervised Student",
    },
    group: {
      color: "gray",
      string: "Involved Group",
    },
    externalcol: {
      color: "gray",
      string: "External Collaborator",
    },
    externalpeer: {
      color: "gray",
      string: "External Peer",
    },
    consulted: {
      color: "gray",
      string: "Consulted Peer",
    },
  };

  type kinds = "core_function" | "science" | "student" | "external";

  const kindOrder = ["science", "student", "core_function", "external"];

  const kindDict = {
    core_function: {
      color: "red",
      string: "Core Function",
      tag: "CF",
      icon: GiMaterialsScience,
    },
    science: {
      color: "green",
      string: "Science",
      tag: "SP",
      icon: MdScience,
    },
    student: {
      color: "blue",
      string: "Student",
      tag: "STP",
      icon: RiBook3Fill,
    },
    external: {
      color: "gray",
      string: "External",
      tag: "EXT",
      icon: FaUserFriends,
    },
  };
  const columnDefs: ColumnDef<IProjectData>[] = [
    // business area
    {
      accessorKey: "business_area",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }
        return (
          // <Text
          //   className="m-0 p-0 text-center"
          //   color={colorMode === "light" ? "black" : "white"}
          // >
          //   Kind
          // </Text>
          <Button
            // variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-center"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Area
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalBaNameData =
          row?.original?.business_area?.name || "Unset";
        // console.log(row.original);

        const formattedString = returnHTMLTitle(originalBaNameData);

        // console.log({ originalKindData, formattedString });
        return (
          <Box className="text-center align-middle font-medium">
            <Text>{formattedString}</Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const businessAreaA = rowA?.original?.business_area?.name || "Unset";
        const businessAreaB = rowB?.original?.business_area?.name || "Unset";
        const formattedA = returnHTMLTitle(businessAreaA);
        const formattedB = returnHTMLTitle(businessAreaB);
        const a = formattedA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = formattedB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);

        // const indexA = roleOrder.indexOf(businessAreaA);
        // const indexB = roleOrder.indexOf(businessAreaB);
        // return indexA - indexB;
      },
    },
    // title
    {
      accessorKey: "title",
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
            // variant="ghost"
            bg={"transparent"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-left"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            justifyContent={"flex-start"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Title
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalTitleData = row?.original?.title;
        const formatted = returnHTMLTitle(originalTitleData);
        const originalImageData = row?.original?.image;
        return (
          <Flex
            className="text-left font-medium"
            // alignItems={"center"}
            flexDir={"column"}
          >
            <Box display={"flex"}>
              <Image
                // float={"left"}
                mr={4}
                objectFit={"cover"}
                src={
                  originalImageData !== null && originalImageData !== undefined
                    ? originalImageData?.file
                      ? `${baseUrl}${originalImageData.file}`
                      : noImage
                    : noImage
                }
                boxSize={"70px"}
                rounded={"lg"}
                ml={4}
              />
              <Box display={"flex"} flexDir={"column"}>
                <Text
                  color={colorMode === "dark" ? "blue.200" : "blue.400"}
                  fontWeight={"bold"}
                  _hover={{
                    color: colorMode === "dark" ? "blue.100" : "blue.300",
                    textDecoration:
                      colorMode === "dark" ? "underline" : "undefined",
                  }}
                  cursor={"pointer"}
                  px={4}
                >
                  {formatted}
                </Text>
                <Text
                  color={"gray.400"}
                  fontWeight={"semibold"}
                  fontSize={"small"}
                  px={4}
                >
                  {row.original.tag}
                </Text>
                {disabledColumns.created_at === true ? (
                  <Text
                    color={"gray.400"}
                    fontWeight={"semibold"}
                    fontSize={"x-small"}
                    px={4}
                  >
                    Created on {formatDate(row?.original?.created_at)}
                  </Text>
                ) : null}
              </Box>
            </Box>
          </Flex>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalTitleDataA = rowA.original.title;
        const originalTitleDataB = rowB.original.title;
        const formattedA = returnHTMLTitle(originalTitleDataA);
        const formattedB = returnHTMLTitle(originalTitleDataB);
        const a = formattedA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = formattedB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);
        // return formattedA.localeCompare(formattedB);
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original.title;
        function matchHTMLTitle(
          htmlContent: string,
          searchText: string,
        ): boolean {
          const extractedTitle = returnHTMLTitle(htmlContent);
          return extractedTitle
            .toLowerCase()
            .includes(searchText.toLowerCase());
        }
        return matchHTMLTitle(cellValue, filterValue);
      },
    },
    // kind
    {
      accessorKey: "kind",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }
        return (
          // <Text
          //   className="m-0 p-0 text-center"
          //   color={colorMode === "light" ? "black" : "white"}
          // >
          //   Kind
          // </Text>
          <Button
            // variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-center"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Kind
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalKindData: kinds = row.getValue("kind");

        const formattedString = kindDict[originalKindData].string;
        const formattedIcon = kindDict[originalKindData].icon;
        const formattedColour = kindDict[originalKindData].color;

        // console.log({ originalKindData, formattedString });
        return (
          <Box className="text-center align-middle font-medium">
            {/* <Text>{formattedString}</Text> */}
            <Icon
              as={formattedIcon}
              color={`${formattedColour}.500`}
              boxSize={"22px"}
            />
            <Text color={`${formattedColour}.500`}>{formattedString}</Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const kindA: kinds = rowA.getValue("kind");
        const kindB: kinds = rowB.getValue("kind");
        const indexA = kindOrder.indexOf(kindA);
        const indexB = kindOrder.indexOf(kindB);
        return indexA - indexB;
      },
    },
    // role
    {
      accessorKey: "role",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

        if (isSorted === "asc") {
          sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
        } else if (isSorted === "desc") {
          sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
        }
        return (
          // <Text
          //   className="m-0 p-0 text-center"
          //   color={colorMode === "light" ? "black" : "white"}
          // >
          //   Kind
          // </Text>
          <Button
            // variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-center"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            bg={"transparent"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Role
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalRoleData: ProjectRoles = row?.original?.role;
        // console.log(row.original);

        const formattedString = roleDict[originalRoleData].string;
        const formattedColour = roleDict[originalRoleData].color;

        // console.log({ originalKindData, formattedString });
        return (
          <Box className="text-center align-middle font-medium">
            <Text color={`${formattedColour}.500`}>{formattedString}</Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const roleA: ProjectRoles = rowA.original.role;
        const roleB: ProjectRoles = rowB.original.role;
        const indexA = roleOrder.indexOf(roleA);
        const indexB = roleOrder.indexOf(roleB);
        return indexA - indexB;
      },
    },
    // created_at
    {
      accessorKey: "created_at",
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
            // variant="ghost"
            bg={"transparent"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-left"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            justifyContent={"flex-start"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Created
          </Button>
        );
      },
      cell: ({ row }) => {
        // const date:Date = row.getValue("created_at");
        // const formatted = returnHTMLTitle(originalTitleData);
        return (
          <Box className="text-left font-medium">
            <Text fontSize={"x-small"}>
              {formatDate(row.getValue("created_at"))}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalCreatedAtDataA = rowA.original.created_at;
        const originalCreatedAtDataB = rowB.original.created_at;

        const dateA = new Date(originalCreatedAtDataA);
        const dateB = new Date(originalCreatedAtDataB);

        // Compare the Date objects
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return 0;
      },
    },
    // status
    {
      accessorKey: "status",
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
            className="w-full text-right"
            rightIcon={sortIcon}
            justifyContent={"flex-end"}
            _hover={
              colorMode === "dark"
                ? { bg: "blue.400", color: "white" }
                : { bg: "blue.50", color: "black" }
            }
          >
            Status
          </Button>
        );
      },

      cell: ({ row }) => {
        const originalStatusData: statuses = row.getValue("status");

        const formatted = statusMapping[originalStatusData] || "Other";

        return (
          <Box
            className="text-right font-medium"
            color={colorMode === "light" ? "gray.500" : "gray.300"}
            px={4}
          >
            {formatted}
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusA: statuses = rowA.getValue("status");
        const statusB: statuses = rowB.getValue("status");
        const indexA = statusOrder.indexOf(statusA);
        const indexB = statusOrder.indexOf(statusB);
        return indexA - indexB;
      },
      filterFn: (row, columnId, filterValue) => {
        const originalStatus = row.getValue(columnId);
        const inactiveStatuses = ["completed", "terminated", "suspended"];

        if (filterValue) {
          // If the checkbox is checked, filter out inactive statuses
          return !inactiveStatuses.includes(originalStatus as string);
        }
        return true; // Otherwise, show all statuses
      },
    },
  ];

  const columns = columnDefs.filter(
    (column) =>
      !disabledColumns[(column as any).accessorKey as ProjectColumnTypes],
  );

  // type columnTypes = "kind" | "title" | "status" | "image" | "role" | "created_at";

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: defaultSorting,
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // created_at: false,
  });

  const data = projectData;
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

  useEffect(() => {
    table.getColumn("status")?.setFilterValue(hideInactive);
  }, [table, hideInactive]);

  return (
    <div className="rounded-b-md border">
      {filters && (
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              // className="size-4 max-w-sm text-black"
              id="hideInactive"
              checked={hideInactive}
              onCheckedChange={() => {
                setHideInactive((prev) => !prev);
                table.getColumn("status")?.setFilterValue(!hideInactive); // Toggle the filter value
              }}
              aria-label="Hide Inactive"
            />
            <Tooltip
              label="Hides terminated, suspended and completed projects"
              aria-label="A tooltip"
            >
              <label
                htmlFor="hideInactive"
                className={
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                }
              >
                Hide Inactive
              </label>
            </Tooltip>
          </div>
          <Input
            placeholder="Filter projects by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(e) => {
              table
                .getColumn("title")
                ?.setFilterValue(returnHTMLTitle(e.target.value));
            }}
            className="max-w-sm text-black"
          />
        </div>
      )}
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  colorMode === "light" ? twRowClassLight : twRowClassDark
                }
                data-state={row.getIsSelected() && "selected"}
                onClick={(e) =>
                  goToProject(
                    e,
                    row?.original?.id ? row?.original?.id : row?.original?.pk,
                  )
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
