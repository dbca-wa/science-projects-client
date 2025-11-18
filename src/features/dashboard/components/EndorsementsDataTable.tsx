import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { IMiniEndorsement } from "@/shared/types/index.d";
import { Box, Button, Icon, Text, useColorMode } from "@chakra-ui/react";

import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
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
            // variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-center"
            rightIcon={sortIcon}
            // p={0}
            // m={0}
            // px={"10px"}
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
        // const originalKindData: endorsementKinds = row.getValue("kind");
        const formattedString = endorsementKindDict["aec"].string;
        const formattedIcon = endorsementKindDict["aec"].icon;
        const formattedColour = endorsementKindDict["aec"].color;

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
            bg={"transparent"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full text-left"
            rightIcon={sortIcon}
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
        const originalTitleData =
          row.original.project_plan.document.project.title;
        const formatted = returnHTMLTitle(originalTitleData);
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
              {formatted}
            </Text>
            <Text
              color={"gray.400"}
              fontWeight={"semibold"}
              fontSize={"small"}
              px={4}
            >
              {
                projectKindDict[
                  row.original.project_plan.document.project
                    .kind as projectKinds
                ].tag
              }
              -{row.original.project_plan.document.project.year}-
              {row.original.project_plan.document.project.number}
            </Text>
            <Text
              color={"gray.500"}
              fontWeight={"semibold"}
              fontSize={"small"}
              px={4}
            >
              {endorsementKindDict["aec"].todoDescription}
            </Text>
          </Box>
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
                {/* <Text mt={4} mx={2}> */}
                No Endorsements Required From You!
                {/* </Text> */}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
