import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IProjectData } from "@/types";
import { Box, Button, Icon, Text, useColorMode } from "@chakra-ui/react";

import { useProjectSearchContext } from "@/lib/hooks/helper/ProjectSearchContext";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export interface IProblemProjectData extends IProjectData {
  problemKind:
  | "memberless"
  | "leaderless"
  | "multiple_leaders"
  | "externally_led";
}

interface Props {
  projectData: IProblemProjectData[];
}

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



export const ProblematicProjectsDataTable = ({ projectData }: Props) => {
  const { colorMode } = useColorMode();
  // console.log(projectData);

  const { isOnProjectsPage } = useProjectSearchContext();
  const navigate = useNavigate();
  const goToProject = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
  ) => {
    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else {
      if (e.ctrlKey || e.metaKey) {
        window.open(`/projects/${pk}`, "_blank"); // Opens in a new tab
      } else {
        navigate(`/projects/${pk}`);
      }
    }
  };

  type problems =
    | "memberless"
    | "leaderless"
    | "externally_led"
    | "multiple_leaders";

  type kinds = "core_function" | "science" | "student" | "external";

  const problemOrder = [
    "memberless",
    "externally_led",
    "leaderless",
    "multiple_leaders",
  ];

  const kindOrder = ["science", "student", "core_function", "external"];

  const problemMapping = {
    memberless: {
      title: "No Members",
      description: "This project has no members and cannot progress! Add members and set a leader to fix this problem",
      color: "red",
    },
    leaderless: {
      title: "No Leader Tag",
      description: "The leader tag for this project has not been set. Projects with members always have a leader - if the tag isnt appearing, assign another user as leader then set it back to fix this problem.",
      color: "orange",
    },
    externally_led: {
      title: "Externally Led",
      description: "This project is externally led and cannot progress! Each project needs a DBCA staff member set as the leader to fix the problem",
      color: "red",
    },
    multiple_leaders: {
      title: "Multiple Leader Tags",
      description: "This project has multiple leader tags due to the renaming of 'Supervising Scientist' to 'Project Leader', set the tags appropriately to fix this issue.",
      color: "yellow",
    },
  };

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
  const columns: ColumnDef<IProjectData>[] = [
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
          // <Button
          //   // variant="ghost"
          //   bg={"transparent"}
          //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          //   className="w-full text-left"
          //   rightIcon={sortIcon}
          //   _hover={
          //     colorMode === "dark"
          //       ? { bg: "blue.400", color: "white" }
          //       : { bg: "blue.50", color: "black" }
          //   }
          // >
          //   Status
          // </Button>
          <Button
            // variant="ghost"
            bg={"transparent"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-right"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
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
    },
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
        const originalTitleData = row.getValue("title");
        const formatted = returnHTMLTitle(originalTitleData);
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
            formattedDate.slice(0, monthIndex + month.length) +
            "," +
            formattedDate.slice(monthIndex + month.length);

          return formattedDate;
        };


        const tag = row.original.tag;
        return (
          <Box className="text-left font-medium">
            <Text
              color={colorMode === "dark" ? "blue.200" : "blue.400"}
              fontWeight={"bold"}
              _hover={{
                color: colorMode === "dark" ? "blue.100" : "blue.300",
                textDecoration:
                  colorMode === "dark" ? "underline" : "undefined",
              }}
              cursor={"pointer"}
              // onClick={(e) => goToProject(e, row.original.id)}
              px={4}
            >
              {formatted}
            </Text>
            <Text
              color={"gray.400"}
              fontWeight={"semibold"}
              fontSize={"small"}
              // onClick={(e) => goToProject(e, row.original.id)}
              px={4}
            >
              {tag}
            </Text>
            <Text
              color={"gray.400"}
              fontWeight={"semibold"}
              fontSize={"x-small"}
              // onClick={(e) => goToProject(e, row.original.id)}
              px={4}
            >
              Created on {formatDate(row.getValue("created_at"))}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalTitleDataA = rowA.getValue("title");
        const originalTitleDataB = rowB.getValue("title");
        const formattedA = returnHTMLTitle(originalTitleDataA);
        const formattedB = returnHTMLTitle(originalTitleDataB);
        const a = formattedA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = formattedB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "problemKind",
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
            className="w-full text-right"
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
            Problem
          </Button>
        );
      },

      cell: ({ row }) => {
        const originalProblemData: problems = row.getValue("problemKind");
        const formatted = problemMapping[originalProblemData].title || "Other";
        const formattedProblem = problemMapping[originalProblemData].description;
        return (
          <Box
            className="text-left font-medium"
            color={colorMode === "light" ? `${problemMapping[originalProblemData].color}.500` : `${problemMapping[originalProblemData].color}.300`}
            px={4}
          >
            {formatted}

            <Text
              color={"gray.500"}
              fontWeight={"semibold"}
              fontSize={"x-small"}
            // onClick={(e) => goToProject(e, row.original.id)}
            >
              {formattedProblem}

            </Text>

          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const problemA: problems = rowA.getValue("problemKind");
        const problemB: problems = rowB.getValue("problemKind");
        const indexA = problemOrder.indexOf(problemA);
        const indexB = problemOrder.indexOf(problemB);
        return indexA - indexB;
      },
    },
    // {
    //   accessorKey: "kind",
    //   header: ({ column }) => {
    //     const isSorted = column.getIsSorted();
    //     let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;

    //     if (isSorted === "asc") {
    //       sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
    //     } else if (isSorted === "desc") {
    //       sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
    //     }
    //     return (
    //       // <Text
    //       //   className="m-0 p-0 text-center"
    //       //   color={colorMode === "light" ? "black" : "white"}
    //       // >
    //       //   Kind
    //       // </Text>
    //       <Button
    //         // variant="ghost"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //         className="w-full text-center"
    //         rightIcon={sortIcon}
    //         // p={0}
    //         // m={0}
    //         bg={"transparent"}
    //         _hover={
    //           colorMode === "dark"
    //             ? { bg: "blue.400", color: "white" }
    //             : { bg: "blue.50", color: "black" }
    //         }
    //       >
    //         Kind
    //       </Button>
    //     );
    //   },
    //   cell: ({ row }) => {
    //     const originalKindData: kinds = row.getValue("kind");

    //     const formattedString = kindDict[originalKindData].string;
    //     const formattedIcon = kindDict[originalKindData].icon;
    //     const formattedColour = kindDict[originalKindData].color;

    //     // console.log({ originalKindData, formattedString });
    //     return (
    //       <Box className="text-center align-middle font-medium">
    //         {/* <Text>{formattedString}</Text> */}
    //         <Icon
    //           as={formattedIcon}
    //           color={`${formattedColour}.500`}
    //           boxSize={"22px"}
    //         />
    //         <Text color={`${formattedColour}.500`}>{formattedString}</Text>
    //       </Box>
    //     );
    //   },
    //   sortingFn: (rowA, rowB) => {
    //     const kindA: kinds = rowA.getValue("kind");
    //     const kindB: kinds = rowB.getValue("kind");
    //     const indexA = kindOrder.indexOf(kindA);
    //     const indexB = kindOrder.indexOf(kindB);
    //     return indexA - indexB;
    //   },
    // },


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
            Created On
          </Button>
        );
      },
      cell: ({ row }) => {
        // const date:Date = row.getValue("created_at");
        // const formatted = returnHTMLTitle(originalTitleData);
        return (
          <Box className="text-left font-medium">
            {/* <Text
                color={colorMode === "dark" ? "blue.200" : "blue.400"}
                fontWeight={"bold"}
                _hover={{
                  color: colorMode === "dark" ? "blue.100" : "blue.300",
                  textDecoration: "underline",
                }}
                cursor={"pointer"}
                // onClick={(e) => goToProject(e, row.original.id)}
                px={4}
              >
                {date}
              </Text> */}
            <Text>{row.getValue("created_at")}</Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalTitleDataA = rowA.getValue("title");
        const originalTitleDataB = rowB.getValue("title");
        const formattedA = returnHTMLTitle(originalTitleDataA);
        const formattedB = returnHTMLTitle(originalTitleDataB);
        const a = formattedA.replace(/<\/?[^>]+(>|$)/g, "").trim();
        const b = formattedB.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return a.localeCompare(b);
      },
    },


  ];

  const returnHTMLTitle = (titleData) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = titleData;
    const tag = wrapper.querySelector("p, span");
    if (tag) {
      return tag.textContent;
    }
  };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "title",
      desc: false,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    created_at: false,
  });

  const data = projectData;
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

  const twRowClassLight = "hover:cursor-pointer hover:bg-blue-50";
  const twRowClassDark = "hover:cursor-pointer hover:bg-inherit";

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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  colorMode === "light" ? twRowClassLight : twRowClassDark
                }
                data-state={row.getIsSelected() && "selected"}
                onClick={(e) => goToProject(e, row.original.pk)}
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
                You are currently not associated with any projects.
                {/* </Text> */}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
