import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { IMiniEndorsement } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";

import { useProjectSearchContext } from "@/features/projects/hooks/useProjectSearch";
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import React, { useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaShieldDog } from "react-icons/fa6";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

interface Props {
  pendingEndorsementsData: any;
}

export const EndorsementsDataTable = ({ pendingEndorsementsData }: Props) => {
  const { colorMode } = useColorMode();
  // console.log(projectData);
  //   useEffect(() => console.log(pendingEndorsementsData));

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
          window.open(`projects/${pk}/project`, "_blank"); // Opens in a new tab
        } else {
          navigate(`projects/${pk}/project`);
        }
      }
    }
  };

  type projectKinds = "core_function" | "science" | "student" | "external";
  //   type endorsementKinds = "aec" | "bm" | "hc";
  //   const endorsementKindOrder = ["bm", "aec", "hc"];
  // Only AEC used currently (others removed on Directorate request)
  const endorsementKindDict = {
    aec: {
      color: "blue",
      string: "AEC",
      icon: FaShieldDog,
      todoDescription:
        "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval",
    },
  };

  const projectKindDict = {
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

  const columns: ColumnDef<IMiniEndorsement>[] = [
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={`w-full text-center bg-transparent hover:${
              colorMode === "dark" ? "bg-blue-400 text-white" : "bg-blue-50 text-black"
            }`}
          >
            Kind
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        // const originalKindData: endorsementKinds = row.getValue("kind");
        const formattedString = endorsementKindDict["aec"].string;
        const formattedIcon = endorsementKindDict["aec"].icon;
        const formattedColour = endorsementKindDict["aec"].color;

        return (
          <div className="text-center align-middle font-medium">
            <div className={`text-${formattedColour}-500`}>
              {React.createElement(formattedIcon, { size: 22 })}
            </div>
            <p className={`text-${formattedColour}-500`}>{formattedString}</p>
          </div>
        );
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
            className={`w-full text-left bg-transparent justify-start hover:${
              colorMode === "dark" ? "bg-blue-400 text-white" : "bg-blue-50 text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            {sortIcon}
          </Button>
        );
      },
      cell: ({ row }) => {
        const originalTitleData =
          row.original.project_plan.document.project.title;
        const formatted = returnHTMLTitle(originalTitleData);
        return (
          <div className="text-left font-medium">
            <p
              className={`px-4 font-bold cursor-pointer hover:underline ${
                colorMode === "dark" ? "text-blue-200 hover:text-blue-100" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              {formatted}
            </p>
            <p className="text-gray-400 font-semibold text-sm px-4">
              {
                projectKindDict[
                  row.original.project_plan.document.project
                    .kind as projectKinds
                ].tag
              }
              -{row.original.project_plan.document.project.year}-
              {row.original.project_plan.document.project.number}
            </p>
            <p className="text-gray-500 font-semibold text-sm px-4">
              {endorsementKindDict["aec"].todoDescription}
            </p>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const originalTitleDataA =
          rowA.original.project_plan.document.project.title;
        const originalTitleDataB =
          rowB.original.project_plan.document.project.title;
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
    const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
    if (tag) {
      return tag.textContent;
    } else {
      console.log(wrapper.innerHTML);
      return wrapper.innerHTML;
    }
  };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "title",
      desc: false,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // created_at: false,
  });

  const data = pendingEndorsementsData?.aec as IMiniEndorsement[];
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
                onClick={(e) =>
                  goToProject(e, row.original.project_plan.document.project.pk)
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
              {/* pendingEndorsementsData?.aec?.length >= 1 */}
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                No Endorsements Required From You!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
