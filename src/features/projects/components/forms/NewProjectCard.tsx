// Handler for displaying card data for creation of new projects; core function etc.

import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import ParallaxTilt from "react-parallax-tilt";
import { CreateProjectModal } from "@/features/projects/components/modals/CreateProjectModal";
import { cn } from "@/shared/utils/component.utils";

interface INewProjectCard {
  title: string;
  description: string;
  bulletPoints: string[];
  colorScheme: string;
  color?: string;
  buttonIcon: IconType;
}

export const NewProjectCard = ({
  title,
  description,
  bulletPoints,
  color,
  colorScheme,
  buttonIcon,
}: INewProjectCard) => {
  const { colorMode } = useColorMode();
  const ButtonIcon = buttonIcon;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCreateProjectModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.035,
      rotateX: 7,
      transition: {
        scale: { duration: 0.3 },
        rotateX: { delay: 0.15, duration: 0.3 },
      },
    },
  };

  return (
    <ParallaxTilt
      tiltMaxAngleY={2}
      tiltMaxAngleX={0}
      style={{ perspective: 1000, height: "100%", minHeight: "320px" }}
    >
      <motion.div
        className={cn(
          "h-full rounded-xl flex flex-col p-6 relative cursor-pointer",
          colorMode === "light" ? "bg-black/20" : "bg-gray-700"
        )}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          backfaceVisibility: "hidden",
          boxShadow: "0px 14px 21px -7px rgba(0, 0, 0, 0.21), 0px 2.8px 3.5px -1.4px rgba(0, 0, 0, 0.042), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.07), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.07)"
        }}
        initial={"rest"}
        whileHover="hover" // Reference to the hover key in cardVariants
        variants={cardVariants} // Variants for the animations
        onClick={() => {
          openCreateProjectModal();
        }}
      >
        <CreateProjectModal
          projectType={title}
          isOpen={isModalOpen}
          onClose={closeModal}
          icon={buttonIcon}
        />

        {/* TITLE */}
        <div
          className="inline-flex items-center justify-center w-full h-20 rounded-xl relative p-4 text-white"
          style={{
            background: color ? color : undefined,
            transform: "translateZ(0)",
            transition: "transform 0.3s ease",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            className="mr-4"
            style={{
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            <ButtonIcon
              size={"40px"}
              style={{
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            {title}
          </h3>
        </div>

        <div className="mx-8">
          {/* DESCRIPTION */}
          <div
            className={cn(
              "my-4 py-4 mx-2",
              colorMode === "light" ? "text-black/80" : "text-white/80"
            )}
          >
            <p className="text-base">{description}</p>
          </div>

          {/* INFO */}
          <div
            className={cn(
              "mx-6 pb-4 ml-10",
              colorMode === "light" ? "text-black/80" : "text-white/80"
            )}
          >
            <ul className="list-disc -mt-1">
              {bulletPoints.map((point, index2) => (
                <li key={index2} className="text-sm">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </ParallaxTilt>
  );
};
