import { DisplayRTE } from "@/shared/components/RichTextEditor/Editors/DisplayRTE";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { BusinessAreaImage, IUserMe } from "@/shared/types";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { EditMyBusinessAreaModal } from "./EditMyBusinessAreaModal";

interface IMyBaUpdateData {
  leader: IUserMe;
  pk: number;
  name: string;
  introduction: string;
  image: BusinessAreaImage;
  refetch: () => void;
}

export const BusinessAreaEditableDisplay = ({
  pk,
  name,
  introduction,
  image,
  leader,
  refetch,
}: IMyBaUpdateData) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  
  const onMouseOver = () => {
    if (!isHovered) {
      setIsHovered(true);
    }
  };

  const onMouseOut = () => {
    if (isHovered) {
      setIsHovered(false);
    }
  };

  const NoImageFile = useNoImage();
  const apiEndpoint = useApiEndpoint();

  return (
    <>
      <EditMyBusinessAreaModal
        pk={pk}
        isOpen={isOpen}
        onClose={onClose}
        introduction={introduction}
        image={image?.file}
        refetch={refetch}
      />
      <div
        className={`overflow-hidden rounded-lg pb-8 mb-20 ${
          isDark ? "bg-gray-700" : "bg-gray-50"
        }`}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseOut}
      >
        {/* BA image and title */}
        <div
          className="rounded w-full h-[23vh] min-h-[285px] relative select-none"
          style={{ userSelect: "none" }}
          draggable={false}
        >
          <div
            className="absolute right-0 bottom-[30px] z-0 w-[76%] h-[70px] flex items-center bg-white/60 border-3 border-[#396494] rounded-l-[30px] border-r-0"
          >
            <p
              className="pl-4 font-bold text-[28px] text-black select-none"
              style={{ userSelect: "none" }}
            >
              {name}
            </p>
          </div>
          <img
            className="z-0 top-0 left-0 object-cover w-full h-full select-none"
            src={
              image instanceof File
                ? `${apiEndpoint}${image.name}` // Use the image directly for File
                : image?.file
                  ? `${apiEndpoint}${image.file}`
                  : // : image instanceof string ?
                    NoImageFile
            }
            style={{ userSelect: "none" }}
            draggable={false}
            alt={`${name} business area`}
          />
        </div>

        {/* Program Lead name and Text */}
        <div className="mt-8 px-12 relative">
          {isHovered && (
            <div
              className="bg-green-500 rounded-full w-10 h-10 absolute right-12 -mt-4 hover:cursor-pointer text-white flex items-center justify-center"
              onClick={onOpen}
            >
              <FaEdit className="w-5 h-5 ml-[3px] -mt-0.5" />
            </div>
          )}

          <p className="font-semibold text-justify">
            Program Leader: {leader?.first_name} {leader?.last_name}
          </p>

          {introduction !== "" && (
            <div className="pt-12">
              <DisplayRTE payload={introduction} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
