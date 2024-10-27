import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IAdminTask } from "@/types";
import { Box, Button, Flex, Icon, Text, useColorMode } from "@chakra-ui/react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BsFillSignMergeLeftFill } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

//

interface Props {
  pendingAdminTaskData: IAdminTask[];
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

type taskKinds = "deleteproject" | "mergeuser" | "setcaretaker";
const taskKindsOrder = ["setcaretaker", "deleteproject", "mergeuser"];

const taskKindsDict = {
  deleteproject: {
    title: "Delete Project",
    description: "A user wishes to delete a project. Approve or reject.",
    colour: "red",
    icon: MdDelete,
  },
  mergeuser: {
    title: "Merge User",
    description:
      "A user has requested that two accounts be merged. Approve or reject.",
    colour: "orange",
    icon: BsFillSignMergeLeftFill,
  },
  setcaretaker: {
    title: "Set Caretaker",
    description:
      "A user has requested that another user be set as caretaker whilst they are away. Approve or reject.",
    colour: "blue",
    icon: FaUserCog,
  },
};

export const AdminTasksDataTable = ({ pendingAdminTaskData }: Props) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const goToProjectDocument = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
  ) => {
    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else {
      if (e.ctrlKey || e.metaKey) {
        window.open(`projects/${pk}/overview`, "_blank"); // Opens in a new tab
      } else {
        navigate(`projects/${pk}/overview`);
      }
    }
  };

  const columns: ColumnDef<IAdminTask>[] = [
    {
      accessorKey: "action",
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
            Type
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalKindData: taskKinds = row.original.action;

        const formattedString = taskKindsDict[originalKindData].title;
        const formattedIcon = taskKindsDict[originalKindData].icon;
        const formattedColour = taskKindsDict[originalKindData].colour;

        return (
          <Box className="text-center align-middle font-medium">
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
        const kindA: taskKinds = rowA.original.action;
        const kindB: taskKinds = rowB.original.action;
        // console.log(`A:${kindA}, B:${kindB}`);
        const indexA = taskKindsOrder.indexOf(kindA);
        const indexB = taskKindsOrder.indexOf(kindB);
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
    //     if (isDocTypeTask(row.original)) {
    //       const originalKindData: docKinds = row.original.kind as docKinds;
    //       //   console.log(originalKindData);
    //       return (
    //         <Box className="text-center align-middle font-medium">
    //           {docKindsDict[originalKindData].title}
    //         </Box>
    //       );
    //     }
    //   },
    //   sortingFn: (rowA, rowB) => {
    //     const kindA: docKinds = rowA.getValue("kind");
    //     const kindB: docKinds = rowB.getValue("kind");
    //     const indexA = docKindsOrder.indexOf(kindA);
    //     const indexB = docKindsOrder.indexOf(kindB);
    //     return indexA - indexB;
    //   },
    // },
    {
      accessorKey: "requester",
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
            className="w-full text-start"
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
            Requester
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalRequesterData = row.original.requester;
        return (
          <Box className="justify-start px-4 text-start font-medium">
            <Text color={"blue.400"} fontWeight={"semibold"}>
              {originalRequesterData.display_first_name}{" "}
              {originalRequesterData.display_last_name}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = `${rowA.original.requester.display_first_name} ${rowA.original.requester.display_last_name}`;
        const b = `${rowB.original.requester.display_first_name} ${rowB.original.requester.display_last_name}`;
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "reason",
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
            Details
          </Button>
        );
      },
      cell: ({ row }) => {
        let originalReasonData = row.original.reason;
        originalReasonData =
          row?.original?.action === "deleteproject"
            ? originalReasonData &&
              `${originalReasonData[0].toLocaleUpperCase()}${originalReasonData.slice(1)}`
            : originalReasonData;
        const originalNoteData = row.original.notes;
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
              px={4}
            >
              {originalReasonData || "No reason provided."}
            </Text>
            {originalNoteData && (
              <Text
                color={"gray.400"}
                fontWeight={"semibold"}
                fontSize={"small"}
                px={4}
              >
                {originalNoteData}
              </Text>
            )}
            <Text
              color={"gray.400"}
              fontWeight={"semibold"}
              fontSize={"x-small"}
              px={4}
            >
              {taskKindsDict[row.original.action].description}
            </Text>
            {row?.original?.action === "deleteproject" ? (
              <Text
                color={"red.400"}
                fontWeight={"semibold"}
                fontSize={"x-small"}
                px={4}
              >
                <div className="inline-flex gap-1">
                  <Text>Project:</Text>
                  <ExtractedHTMLTitle
                    htmlContent={row.original.project?.title}
                  />
                  <Text> ({row.original.project?.pk})</Text>
                </div>
              </Text>
            ) : null}

            <Text
              color={"blue.400"}
              fontWeight={"semibold"}
              fontSize={"x-small"}
              px={4}
            >
              Requested by:{" "}
              {`${row.original.requester.display_first_name} ${row.original.requester.display_last_name}`}
            </Text>
          </Box>
        );
      },
      sortingFn: (rowA, rowB) => {
        let originalTitleDataA = "";
        let formattedA = "";
        originalTitleDataA = rowA.original.reason;
        formattedA = returnHTMLTitle(originalTitleDataA)
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim();

        let originalTitleDataB = "";
        let formattedB = "";

        originalTitleDataB = rowB.original.reason;
        formattedB = returnHTMLTitle(originalTitleDataB)
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim();

        const a = formattedA;
        const b = formattedB;
        return a.localeCompare(b);
      },
    },
  ];
  //   console.log(combinedData);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      ...(pendingAdminTaskData?.map((task) => ({
        ...task,
        // taskType: task.action as const,
      })) || []),
      //   ...(pendingProjectDocumentData?.team?.map((teamTask) => ({
      //     ...teamTask,
      //     taskType: "team" as const,
      //   })) || []),
      //   ...(pendingProjectDocumentData?.ba?.map((baTask) => ({
      //     ...baTask,
      //     taskType: "ba" as const,
      //   })) || []),
      //   ...(pendingProjectDocumentData?.directorate?.map((directorateTask) => ({
      //     ...directorateTask,
      //     taskType: "directorate" as const,
      //   })) || []),
    ]);
  }, [pendingAdminTaskData]);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "action",
      desc: false,
    },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      //   //   columnVisibility,
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
                onClick={(e) => {
                  console.log(row.original);
                  goToProjectDocument(e, row.original.project.pk);
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
