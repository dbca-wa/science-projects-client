// The project card used in the traditional layout's accordion section for projects

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { AiFillCalendar, AiFillTag } from "react-icons/ai";
import { TbAlertOctagon } from "react-icons/tb";
import PlaceHolderImage from "@/assets/no-image-placeholder.png";

export interface IProjectCardProps {
  pk: number;
  projectTitle: string;
  authors: string[];
  years: string;
  tags: string[];
  projectTypeTag: string;
  statusTag: string;
  imageUrl: string;
}

export const TraditionalProjectCard = ({
  pk,
  projectTitle,
  imageUrl,
  years,
  authors,
  tags,
  statusTag,
  projectTypeTag,
}: IProjectCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <div
        className={`min-h-[100px] ${
          isDark ? "bg-black/40" : "bg-black/20"
        } rounded-lg mb-4 p-4 grid xl:grid-cols-[40%_60%] grid-cols-1 gap-3`}
      >
        <div className="relative w-full pt-[56.25%] overflow-hidden">
          <img
            src={imageUrl !== "" ? imageUrl : PlaceHolderImage}
            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 object-cover rounded-2xl select-none"
            draggable={false}
          />
        </div>

        <div className="px-2 pb-10">
          <div className="pb-6">
            <Button
              asChild
              variant="link"
              className="text-xl font-bold text-blue-600 hover:text-blue-500 my-2 whitespace-normal text-left h-auto p-0"
            >
              <Link to={`/projects/${pk}`}>
                {projectTitle}
              </Link>
            </Button>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {authors.map(
                (author, index) =>
                  `${author}${index !== authors.length - 1 ? ", " : ""}`
              )}
            </p>
          </div>
          <div className="grid grid-cols-1">
            <div className="pb-4 inline-flex items-center">
              <TbAlertOctagon />
              <div className="grid grid-cols-2 ml-3 gap-4">
                <Badge
                  className={`p-1.5 text-xs text-center justify-center text-white ${
                    projectTypeTag === "Core Function"
                      ? "bg-blue-500"
                      : projectTypeTag === "Science"
                        ? "bg-green-500"
                        : projectTypeTag === "Student"
                          ? "bg-blue-400"
                          : "bg-gray-400"
                  }`}
                >
                  {projectTypeTag}
                </Badge>

                <Badge
                  className={`p-1.5 text-xs text-center justify-center text-white ${
                    statusTag === "Completed"
                      ? "bg-green-800"
                      : statusTag === "Update Requested"
                        ? "bg-red-500"
                        : statusTag === "Active"
                          ? "bg-green-300"
                          : "bg-gray-200"
                  }`}
                >
                  {statusTag}
                </Badge>
              </div>
            </div>
            {years ? (
              <div className="pb-4 inline-flex items-center">
                <AiFillCalendar size={16} />
                <div className="ml-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-7">
                  <Badge
                    className={`ml-1 ${
                      isDark ? "bg-gray-600" : "bg-black/10"
                    }`}
                  >
                    {years}
                  </Badge>
                </div>
              </div>
            ) : (
              <p>No dates provided.</p>
            )}
            {tags.length !== 0 ? (
              <div className="inline-flex pb-4">
                <AiFillTag size={16} />
                <div className="ml-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 h-7">
                  {tags.map((tag, index) => {
                    return (
                      <Badge
                        key={index}
                        className={`text-center justify-center p-2.5 ${
                          isDark ? "bg-gray-600" : "bg-black/10"
                        }`}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>No tags provided.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
