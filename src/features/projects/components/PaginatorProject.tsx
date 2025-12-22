// A paginator for the projects page

import type { IProjectData } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import { ModernProjectCard } from "./cards/ModernProjectCard";

interface IPaginationProps {
  loading: boolean;
  data: IProjectData[];
  currentProjectResultsPage: number;
  setCurrentProjectResultsPage: (page: number) => void;
  totalPages: number;
}

export const PaginatorProject = ({
  loading,
  data,
  currentProjectResultsPage,
  setCurrentProjectResultsPage,
  totalPages,
}: IPaginationProps) => {
  const handleClick = (pageNumber: number) => {
    setCurrentProjectResultsPage(pageNumber);
  };

  // useEffect(() => console.log(currentProjectResultsPage));
  const maxDisplayedPages = 8;

  // Calculate the start and end page numbers for rendering
  let startPage = Math.max(
    1,
    currentProjectResultsPage - Math.floor(maxDisplayedPages / 2),
  );
  const endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  if (endPage - startPage < maxDisplayedPages - 1) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  const { layout } = useLayoutSwitcher();

  return (
    <div className="min-h-[69vh] relative flex flex-col">
      <div className="h-full flex-1">
        {/* Render the current page's data */}
        {!loading ? (
          <AnimatePresence>
            <div
              className={`mt-8 grid gap-8 ${
                layout === "modern"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-6"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              }`}
            >
              {data.map((project: IProjectData, index: number) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.7, delay: (index + 1) / 7 }}
                    style={{
                      height: "100%",
                      animation: "oscillate 8s ease-in-out infinite",
                    }}
                  >
                    <ModernProjectCard
                      pk={project.id}
                      areas={project.areas}
                      image={project.image}
                      title={project?.title}
                      description={project.description}
                      kind={project.kind}
                      status={project.status}
                      keywords={project.keywords}
                      tagline={project.tagline}
                      year={project.year}
                      number={project.number}
                      business_area={project.business_area}
                      start_date={project.start_date}
                      end_date={project.end_date}
                      created_at={project.created_at}
                      updated_at={project.updated_at}
                      deletion_requested={project.deletion_requested}
                      deletion_request_id={project.deletion_request_id}
                    />
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        ) : (
          // Render a loading spinner while fetching data
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        )}
      </div>
      <div className="h-full mt-8 flex justify-center">
        {/* Render the pagination buttons */}
        <Button
          disabled={currentProjectResultsPage === 1}
          onClick={() => {
            handleClick(currentProjectResultsPage - 1);
            window.scrollTo(0, 0);
          }}
          className="mx-1"
        >
          Prev
        </Button>
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
          <Button
            key={startPage + i}
            onClick={() => {
              handleClick(startPage + i);
              window.scrollTo(0, 0);
            }}
            className="mx-1"
            variant={
              startPage + i === currentProjectResultsPage ? "default" : "outline"
            }
          >
            {startPage + i}
          </Button>
        ))}
        <Button
          disabled={currentProjectResultsPage === totalPages}
          onClick={() => {
            handleClick(currentProjectResultsPage + 1);
            window.scrollTo(0, 0);
          }}
          className="mx-1"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
