import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { IMainDoc } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
} from "react-icons/tb";
import { useNavigate } from "react-router-dom";

interface IPendingProjectDocumentData {
  all: IMainDoc[];
  team: IMainDoc[];
  ba: IMainDoc[];
  lead: IMainDoc[];
  directorate: IMainDoc[];
}

interface Props {
  pendingProjectDocumentData: IPendingProjectDocumentData;
  isCaretakerTable?: boolean;
}

const returnHTMLTitle = (titleData) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = titleData;
  const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
  if (tag) {
    return tag.textContent;
  } else {
    console.log(wrapper.innerHTML);
    return wrapper.innerHTML;
  }
};

type kinds = "core_function" | "science" | "student" | "external";

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

interface IDocTypeTask extends IMainDoc {
  taskType: "all" | "team" | "lead" | "ba" | "directorate";
}

type taskKinds = "all" | "team" | "lead" | "ba" | "directorate";
const taskKindsOrder = ["team", "lead", "ba", "directorate"];
const taskKindsDict = {
  team: {
    title: "Team Member",
    description:
      "Work with Team on document and get approval from Project Lead",
    colour: "blue",
    icon: TbCircleNumber1Filled,
  },
  lead: {
    title: "Project Lead",
    description: "Determine if the project document is satisfactory",
    colour: "green",
    icon: TbCircleNumber1Filled,
  },
  ba: {
    title: "Business Area Lead",
    description: "Determine if the project document is satisfactory",
    colour: "orange",
    icon: TbCircleNumber2Filled,
  },
  directorate: {
    title: "Directorate",
    description: "Determine if the project document is satisfactory",
    colour: "red",
    icon: TbCircleNumber3Filled,
  },
};

type docKinds =
  | "concept"
  | "projectplan"
  | "progressreport"
  | "studentreport"
  | "projectclosure";
const docKindsOrder = [
  "concept",
  "projectplan",
  "progressreport",
  "studentreport",
  "projectclosure",
];
const docKindsDict = {
  concept: {
    title: "Concept Plan",
  },
  projectplan: {
    title: "Project Plan",
  },
  progressreport: {
    title: "Progress Report",
  },
  studentreport: {
    title: "Student Report",
  },
  projectclosure: {
    title: "Project Closure",
  },
};

// Type Guards
// Type Guards
function isDocTypeTask(taskRow: any): taskRow is IDocTypeTask {
  return "project" in taskRow;
}

export const DocumentsDataTable = ({
  pendingProjectDocumentData,
  isCaretakerTable,
}: Props) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const goToProjectDocument = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
    docKind: string,
  ) => {
    let docKindString;
    if (docKind === "concept") {
      docKindString = "concept";
    } else if (docKind === "projectplan") {
      docKindString = "project";
    } else if (docKind === "progressreport") {
      docKindString = "progress";
    } else if (docKind === "studentreport") {
      docKindString = "student";
    } else if (docKind === "projectclosure") {
      docKindString = "closure";
    }
    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else {
      if (e.ctrlKey || e.metaKey) {
        window.open(`projects/${pk}/${docKindString}`, "_blank"); // Opens in a new tab
      } else {
        navigate(`projects/${pk}/${docKindString}`);
      }
    }
  };

  const caretakerColumn: ColumnDef<IDocTypeTask> = {
    accessorKey: "for_user",
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
          User
        </Button>
      );
    },
    cell: ({ row }) => {
      const isDirectorate = row.original.taskType === "directorate";
      const user = row.original?.for_user;
      const hasImage = user?.image;
      return (
        <div className="flex w-full flex-col items-center justify-center text-center align-middle font-medium">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={
                !isDirectorate
                  ? hasImage
                    ? user.image?.startsWith("http")
                      ? `${user.image}`
                      : `${baseAPI}${user.image}`
                    : noImage
                  : undefined
              }
              alt={
                isDirectorate
                  ? "Directorate"
                  : `${user?.display_first_name} ${user?.display_last_name}`
              }
            />
            <AvatarFallback className={isDirectorate ? "bg-red-500 text-white" : ""}>
              {isDirectorate
                ? "D"
                : `${user?.display_first_name?.[0] || ""}${user?.display_last_name?.[0] || ""}`}
            </AvatarFallback>
          </Avatar>
          <p
            className={`font-semibold px-2 flex items-center ${
              isDirectorate ? "text-red-500" : ""
            }`}
          >
            {isDirectorate
              ? "Directorate"
              : `${user?.display_first_name} ${user?.display_last_name}`}
          </p>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const isDirectorateA = rowA.original.taskType === "directorate";
      const isDirectorateB = rowB.original.taskType === "directorate";

      // If both are directorate or neither are, compare normally
      if (isDirectorateA === isDirectorateB) {
        const nameA = rowA.original?.for_user?.display_first_name ?? "";
        const nameB = rowB.original?.for_user?.display_first_name ?? "";
        return nameA.localeCompare(nameB);
      }

      // Otherwise, directorate should always come last
      return isDirectorateA ? 1 : -1;
    },
    filterFn: (row) => {
      if (hideDirectorate) {
        return row.original.taskType !== "directorate";
      }
      return true;
    },
  };

  const baseColumns: ColumnDef<IDocTypeTask>[] = [
    {
      accessorKey: "capacity",
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
            Level
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalKindData: taskKinds = row.original.taskType;

        const formattedString = taskKindsDict[originalKindData].title;
        const formattedIcon = taskKindsDict[originalKindData].icon;
        const formattedColour = taskKindsDict[originalKindData].colour;

        if (originalKindData !== "all") {
          return (
            <div className="text-center align-middle font-medium">
              <formattedIcon 
                className={`text-${formattedColour}-500 w-[22px] h-[22px]`}
              />
              <p className={`text-${formattedColour}-500`}>{formattedString}</p>
            </div>
          );
        }
      },
      sortingFn: (rowA, rowB) => {
        const kindA: taskKinds = rowA.original.taskType;
        const kindB: taskKinds = rowB.original.taskType;
        // console.log(`A:${kindA}, B:${kindB}`);
        const indexA = taskKindsOrder.indexOf(kindA);
        const indexB = taskKindsOrder.indexOf(kindB);
        return indexA - indexB;
      },
    },
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
        if (isDocTypeTask(row.original)) {
          const originalKindData: docKinds = row.original.kind as docKinds;
          //   console.log(originalKindData);
          return (
            <div className="text-center align-middle font-medium">
              {docKindsDict[originalKindData].title}
            </div>
          );
        }
      },
      sortingFn: (rowA, rowB) => {
        const kindA: docKinds = rowA.getValue("kind");
        const kindB: docKinds = rowB.getValue("kind");
        const indexA = docKindsOrder.indexOf(kindA);
        const indexB = docKindsOrder.indexOf(kindB);
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
        if (isDocTypeTask(row.original)) {
          const originalTitleData = row.original.project.title;
          const formatted = returnHTMLTitle(originalTitleData);
          return (
            <div className="text-left font-medium">
              <p
                className={`${
                  colorMode === "dark" 
                    ? "text-blue-200 hover:text-blue-100 hover:underline" 
                    : "text-blue-400 hover:text-blue-300"
                } font-bold cursor-pointer px-4`}
              >
                {formatted}
              </p>
              <p className="text-gray-400 font-semibold text-sm px-4">
                {kindDict[row.original.project.kind as kinds].tag}-
                {row.original.project.year}-{row.original.project.number}
              </p>
              <p className="text-gray-400 font-semibold text-xs px-4">
                {taskKindsDict[row.original.taskType].description}
              </p>
            </div>
          );
        }
      },
      sortingFn: (rowA, rowB) => {
        let originalTitleDataA = "";
        let formattedA = "";
        if (isDocTypeTask(rowA.original)) {
          originalTitleDataA = rowA.original.project.title;
          formattedA = returnHTMLTitle(originalTitleDataA)
            .replace(/<\/?[^>]+(>|$)/g, "")
            .trim();
        }

        let originalTitleDataB = "";
        let formattedB = "";

        if (isDocTypeTask(rowB.original)) {
          originalTitleDataB = rowB.original.project.title;
          formattedB = returnHTMLTitle(originalTitleDataB)
            .replace(/<\/?[^>]+(>|$)/g, "")
            .trim();
        }

        const a = formattedA;
        const b = formattedB;
        return a.localeCompare(b);
      },
    },
  ];

  const columns = isCaretakerTable
    ? [caretakerColumn, ...baseColumns]
    : baseColumns;

  //   console.log(combinedData);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      ...(pendingProjectDocumentData?.lead?.map((leadTask) => ({
        ...leadTask,
        taskType: "lead" as const,
      })) || []),
      ...(pendingProjectDocumentData?.team?.map((teamTask) => ({
        ...teamTask,
        taskType: "team" as const,
      })) || []),
      ...(pendingProjectDocumentData?.ba?.map((baTask) => ({
        ...baTask,
        taskType: "ba" as const,
      })) || []),
      ...(pendingProjectDocumentData?.directorate?.map((directorateTask) => ({
        ...directorateTask,
        taskType: "directorate" as const,
      })) || []),
    ]);
  }, [pendingProjectDocumentData]);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "capacity",
      desc: false,
    },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),

    // onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      //   //   columnVisibility,
      columnFilters,
    },
  });

  const twRowClassLight = "hover:cursor-pointer hover:bg-blue-50";
  const twRowClassDark = "hover:cursor-pointer hover:bg-inherit";

  const [hideDirectorate, setHideDirectorate] = useState(true);

  useEffect(() => {
    if (!isCaretakerTable) return;
    table.getColumn("for_user")?.setFilterValue(!hideDirectorate);
  }, [hideDirectorate, isCaretakerTable]);

  return (
    <div className="rounded-b-md border">
      {columns?.includes(caretakerColumn) &&
        data?.some((t) => t?.taskType === "directorate") && (
          <div className="flex items-center justify-end space-x-2 p-4">
            <Checkbox
              // className="size-4 max-w-sm text-black"
              id="hideDirectorate"
              checked={hideDirectorate}
              onCheckedChange={() => {
                setHideDirectorate((prev) => !prev);
                table.getColumn("for_user")?.setFilterValue(!hideDirectorate); // Toggle the filter value
              }}
              aria-label="Hide Directorate Tasks"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label
                    htmlFor="hideDirectorate"
                    className={
                      "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    }
                  >
                    Hide Directorate Tasks
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hides all tasks which belong to the directorate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                onClick={(e) => {
                  if (isDocTypeTask(row.original)) {
                    goToProjectDocument(
                      e,
                      row.original.project.pk,
                      row.original.kind,
                    );
                  }
                }}
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
                All done!
                {/* </Text> */}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
