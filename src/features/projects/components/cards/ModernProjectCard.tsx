// Modern implementation of project cards for display when searching projects and on the projects tab of dashboard

import { AspectRatio } from "@/shared/components/ui/aspect-ratio";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
import { useNoImage } from "@/shared/hooks/useNoImage";
import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import type { IProjectData } from "@/shared/types";
import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";

export const ModernProjectCard = ({
  pk,
  image,
  title,
  kind,
  status,
  year,
  number,
}: IProjectData) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isOnProjectsPage } = useProjectSearchContext();

  const { colorMode } = useColorMode();
  const imageurl = useServerImageUrl(image?.file);
  // useEffect(() => console.log(title), []);

  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.08,
      transition: {
        scale: { duration: 0.35 },
      },
    },
  };

  const statusDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
    { new: { label: "New", color: "bg-gray-500" } },
    { pending: { label: "Pending Project Plan", color: "bg-yellow-500" } },
    { active: { label: "Active (Approved)", color: "bg-green-500" } },
    { updating: { label: "Update Requested", color: "bg-yellow-500" } },
    { closure_requested: { label: "Closure Requested", color: "bg-orange-500" } },
    { closing: { label: "Closure Pending Final Update", color: "bg-red-500" } },
    { final_update: { label: "Final Update Requested", color: "bg-red-500" } },
    { completed: { label: "Completed and Closed", color: "bg-red-500" } },
    { terminated: { label: "Terminated and Closed", color: "bg-gray-800" } },
    { suspended: { label: "Suspended", color: "bg-gray-500" } },
  ];

  const getStatusValue = (status: string): { label: string; color: string } => {
    const matchedStatus = statusDictionary.find((item) => status in item);
    return matchedStatus
      ? matchedStatus[status]
      : { label: "Unknown Status", color: "bg-gray-500" };
  };

  const [hovered, setHovered] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => console.log(title), [title]);
  const goToProject = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Handle Ctrl + Click (or Command + Click on Mac)
      window.open(`/projects/${pk}/overview`, "_blank"); // Opens in a new tab
    } else {
      // Normal click handling
      if (isOnProjectsPage || window.location.pathname.endsWith("/projects")) {
        navigate(`${pk}/overview`);
      } else {
        navigate(`projects/${pk}/overview`);
      }
    }
  };

  const noImage = useNoImage();
  return (
    <div onClick={goToProject} className="cursor-pointer">
      <Skeleton
        className={`rounded-2xl h-[325px] relative overflow-hidden cursor-pointer shadow-[0px_15px_30px_-10px_rgba(0,0,0,0.5),0px_5px_10px_-5px_rgba(0,0,0,0.1),-2px_0px_10px_-2px_rgba(0,0,0,0.2),2px_0px_10px_-2px_rgba(0,0,0,0.2)] ${
          colorMode === "dark" ? "border border-gray-700" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute left-0 top-0 p-2 z-[999]">
          <Badge
            className={`font-semibold text-white px-2 py-1 text-xs ${
              kind === "core_function"
                ? "bg-red-600"
                : kind === "science"
                  ? "bg-green-500"
                  : kind === "student"
                    ? "bg-blue-400"
                    : "bg-gray-400"
            }`}
          >
            {
              kind === "core_function"
                ? "CF"
                : kind === "external"
                  ? "EXT"
                  : kind === "science"
                    ? "SP"
                    : "STP" //Student
            }
            -{year}-{number}
          </Badge>
        </div>
        <div
          className="absolute left-0 bottom-0 p-4 z-[999] flex"
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="z-[3]">
            <ExtractedHTMLTitle
              htmlContent={title}
              color={"white"}
              fontWeight={"semibold"}
              fontSize={"17px"}
              noOfLines={3}
            />
          </div>
        </div>
        {hovered && (
          <div
            className="absolute top-2 right-0 w-max z-[999]"
            style={{ perspective: 500 }}
          >
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <p
                className={`rounded-l-2xl font-normal text-white px-5 py-1 text-xs ${getStatusValue(status).color}`}
              >
                {getStatusValue(status).label === "Unknown Status"
                  ? status
                  : getStatusValue(status).label}
              </p>
            </motion.div>
          </div>
        )}

        <AspectRatio ratio={16 / 9}>
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`rounded-2xl h-[325px] relative overflow-hidden cursor-pointer shadow-[0px_15px_30px_-10px_rgba(0,0,0,0.5),0px_5px_10px_-5px_rgba(0,0,0,0.1),-2px_0px_10px_-2px_rgba(0,0,0,0.2),2px_0px_10px_-2px_rgba(0,0,0,0.2)] border-gray-700 ${
              colorMode === "dark" ? "bg-black" : ""
            }`}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <img
              loading="lazy"
              className="rounded-2xl pointer-events-none select-none h-full w-full object-cover"
              src={image ? imageurl : noImage}
              onLoad={() => setImageLoaded(true)}
              style={{ imageRendering: "crisp-edges", objectFit: "cover" }}
            />

            <div
              className="absolute left-0 bottom-0 w-full h-1/2"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)"
              }}
            />
          </motion.div>
        </AspectRatio>
      </Skeleton>
    </div>
  );
};
