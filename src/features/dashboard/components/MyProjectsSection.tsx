// Component for displaying the projects the user is involved in on the dashboard (modern)

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { IProjectData } from "@/shared/types";
import { ModernProjectCard } from "@/features/projects/components/cards/ModernProjectCard";

interface IProjectSection {
  data: IProjectData[];
  loading: boolean;
}

export const MyProjectsSection = ({ data, loading }: IProjectSection) => {
  // Combine the arrays in the desired order: inprogress, todo, done
  return loading === true ? (
    <div className="flex h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : (
    <AnimatePresence>
      {data.length === 0 ? (
        <div className="h-full w-full">
          <p>Your projects will be shown here...</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 grid-cols-1 min-[740px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  pk={project.pk !== undefined ? project.pk : project.id}
                  areas={project.areas}
                  image={project.image}
                  title={project.title}
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
      )}
    </AnimatePresence>
  );
};
