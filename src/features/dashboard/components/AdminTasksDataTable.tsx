import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { AdminTableRowWithModal } from "@/features/admin/components/modals/AdminTableRowWithModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { IAdminTask } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";

import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import React, { useEffect, useState } from "react";
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
    // console.log(wrapper.innerHTML);
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={`w-full text-center bg-transparent hover:${
              colorMode === "dark" ? "bg-blue-400 text-white" : "bg-blue-50 text-black"
            }`}
          >
            Type
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalKindData: taskKinds = row.original.action;

        const formattedString = taskKindsDict[originalKindData].title;
        const formattedIcon = taskKindsDict[originalKindData].icon;
        const formattedColour = taskKindsDict[originalKindData].colour;

        return (
          <div className="text-center align-middle font-medium">
            <div className={`text-${formattedColour}-500`}>
              {React.createElement(formattedIcon, { size: 22 })}
            </div>
            <p className={`text-${formattedColour}-500`}>{formattedString}</p>
          </div>
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
            className={`w-full text-start bg-transparent justify-start hover:${
              colorMode === "dark" ? "bg-blue-400 text-white" : "bg-blue-50 text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Requester
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalRequesterData = row.original.requester;
        return (
          <div className="justify-start px-4 text-start font-medium">
            <p className="text-blue-400 font-semibold">
              {originalRequesterData.display_first_name}{" "}
              {originalRequesterData.display_last_name}
            </p>
          </div>
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
            className={`w-full text-left bg-transparent justify-start hover:${
              colorMode === "dark" ? "bg-blue-400 text-white" : "bg-blue-50 text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Details
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        // console.log(row.original);
        let originalReasonData = row.original.reason;
        const formattedDate = formatDate(
          row.original.created_at,
          "dd/MM/yyyy @ h:mm",
        );
        originalReasonData =
          row?.original?.action === "deleteproject"
            ? originalReasonData?.length > 0 &&
              `${originalReasonData[0].toLocaleUpperCase()}${originalReasonData.slice(1)}`
            : row?.original?.action === "setcaretaker"
              ? originalReasonData?.length > 0
                ? `${originalReasonData[0].toLocaleUpperCase()}${originalReasonData.slice(1)}: Set ${row.original.secondary_users[0].display_first_name} ${row.original.secondary_users[0].display_last_name} as caretaker for ${row.original.primary_user.display_first_name} ${row.original.primary_user.display_last_name}'s account`
                : `Set ${row.original.secondary_users[0].display_first_name} ${row.original.secondary_users[0].display_last_name} as caretaker for ${row.original.primary_user.display_first_name} ${row.original.primary_user.display_last_name}'s account`
              : row?.original?.action === "mergeuser"
                ? originalReasonData?.length > 0
                  ? `${originalReasonData[0].toLocaleUpperCase()}${originalReasonData.slice(1)}: Merge ${row.original.secondary_users[0].display_first_name} ${row.original.secondary_users[0].display_last_name} (id:${row.original.secondary_users[0].pk}) into requester's account.`
                  : `Merge ${row.original.secondary_users[0].display_first_name} ${row.original.secondary_users[0].display_last_name} (id:${row.original.secondary_users[0].pk}) into requester's account`
                : originalReasonData;
        const originalNoteData = row.original.notes;
        return (
          <div className="text-left font-medium">
            <p
              className={`px-4 font-bold cursor-pointer hover:underline ${
                colorMode === "dark" ? "text-blue-200 hover:text-blue-100" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              {originalReasonData || "No reason provided."}
            </p>
            {originalNoteData && (
              <p className="text-gray-400 font-semibold text-sm px-4">
                {originalNoteData}
              </p>
            )}
            <p className="text-gray-400 font-semibold text-xs px-4">
              {taskKindsDict[row.original.action].description}
            </p>
            {row?.original?.action === "deleteproject" ? (
              <div className="px-4">
                <span className="text-xs font-semibold text-red-400">
                  Project:{" "}
                  <ExtractedHTMLTitle
                    htmlContent={row.original.project?.title}
                  />{" "}
                  ({row.original.project?.pk})
                </span>
              </div>
            ) : null}

            {/* Group text so it appears next to each other - on same line in same sentence */}
            <div className="flex w-full flex-col flex-nowrap items-center px-4">
              <p className="text-blue-400 font-semibold text-xs w-full">
                Requested by:{" "}
                {`${row.original.requester.display_first_name} ${row.original.requester.display_last_name}`}{" "}
              </p>
              <p className="text-gray-400 font-semibold text-xs ml-1 w-full">
                {` on ${formattedDate}`}
              </p>
            </div>
          </div>
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

  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      ...(pendingAdminTaskData?.map((task) => ({
        ...task,
        // taskType: task.action as const,
      })) || []),
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
    state: {
      sorting,
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
              .rows.map((row) => (
                <AdminTableRowWithModal
                  key={row.id}
                  row={row}
                  colorMode={colorMode}
                  goToProjectDocument={goToProjectDocument}
                />
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                All done!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
