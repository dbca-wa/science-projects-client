// The content for the admin tab in the dashboard. Here admins can change a lot of things, but are
// still somewhat limited as not all functions have been created. Instead the other functions are
// accessible to developers via the django admin panel.

import { BatchApproveModal } from "@/features/documents/components/modals/BatchApproveModal";
import { BatchApproveOldModal } from "@/features/documents/components/modals/BatchApproveOldModal";
import { NewCycleModal } from "@/features/reports/components/modals/NewCycleModal";
import { ProjectLeadEmailModal } from "@/features/projects/components/modals/ProjectLeadEmailModal";
import { Separator } from "@/shared/components/ui/separator";
import { motion } from "framer-motion";
import { type IconType } from "react-icons/lib";
import { FaAddressCard, FaLocationArrow } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { GoOrganization } from "react-icons/go";
import { HiDocumentPlus } from "react-icons/hi2";
import { ImBriefcase } from "react-icons/im";
import {
  MdEmail,
  MdManageHistory,
  MdOutlineSettingsSuggest,
  MdVerifiedUser,
} from "react-icons/md";
import { RiOrganizationChart, RiTeamFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useColorMode } from "@/shared/utils/theme.utils";

export const Admin = () => {
  // State for all modals (replacing useDisclosure hooks)
  const [isBatchApproveOpen, setIsBatchApproveOpen] = useState(false);
  const [isProjectLeadEmailModalOpen, setIsProjectLeadEmailModalOpen] = useState(false);
  const [isBatchApproveOldOpen, setIsBatchApproveOldOpen] = useState(false);
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);

  // Modal control functions
  const onBatchApproveClose = () => setIsBatchApproveOpen(false);
  const onBatchApproveOpen = () => setIsBatchApproveOpen(true);
  const onProjectLeadEmailModalOpen = () => setIsProjectLeadEmailModalOpen(true);
  const onProjectLeadEmailModalClose = () => setIsProjectLeadEmailModalOpen(false);
  const onBatchApproveOldClose = () => setIsBatchApproveOldOpen(false);
  const onBatchApproveOldOpen = () => setIsBatchApproveOldOpen(true);
  const onNewCycleClose = () => setIsNewCycleOpen(false);
  const onNewCycleOpen = () => setIsNewCycleOpen(true);

  const { colorMode } = useColorMode();

  // const handleDataDump = () => {
  //   console.log("Dumping data...");
  // };

  const handleBatchApproveReports = () => {
    onBatchApproveOpen();
  };

  const handleOpenReportCycle = () => {
    onNewCycleOpen();
  };

  const handleSendEmailToProjectLeads = () => {
    onProjectLeadEmailModalOpen();
  };

  const handleBatchApproveOldReports = () => {
    onBatchApproveOldOpen();
  };

  const adminActions = [
    {
      name: "Batch Approve Old Reports",
      description: "Approve all progress reports requesting approval",
      reactIcon: MdVerifiedUser,
      onClick: handleBatchApproveOldReports,
    },
    {
      name: "Batch Approve Reports",
      description: "Approve all progress reports requesting approval",
      reactIcon: FcApproval,
      onClick: handleBatchApproveReports,
    },
    {
      name: "Open Annual Report Cycle",
      description: "Approve all progress reports requesting approval",
      reactIcon: HiDocumentPlus,
      onClick: handleOpenReportCycle,
    },
    {
      name: "Send Email to Project Leads",
      description: "Send an email to all project leads",
      reactIcon: MdEmail,
      onClick: handleSendEmailToProjectLeads,
    },
  ];

  const crudAdminActions = [
    {
      name: "Annual Reports",
      description: "CRUD operations for Annaul Reports",
      reactIcon: MdManageHistory,
      route: "/crud/reports",
    },
    {
      name: "Business Areas",
      description: "CRUD operations for Business Areas",
      reactIcon: ImBriefcase,
      route: "/crud/businessareas",
    },
    {
      name: "Services",
      description: "CRUD operations for Services",
      reactIcon: MdOutlineSettingsSuggest,
      route: "/crud/services",
    },
    {
      name: "Divisions",
      description: "CRUD operations for Divisions",
      reactIcon: GoOrganization,
      route: "/crud/divisions",
    },
    {
      name: "Locations",
      description: "CRUD operations for Areas",
      reactIcon: FaLocationArrow,
      route: "/crud/locations",
    },
    {
      name: "Addresses",
      description: "CRUD operations for Addresses",
      reactIcon: FaAddressCard,
      route: "/crud/addresses",
    },
    {
      name: "Affiliations",
      description: "CRUD operations for Affiliations",
      reactIcon: RiTeamFill,
      route: "/crud/affiliations",
    },
    {
      name: "Branches",
      description: "CRUD operations for Branches",
      reactIcon: RiOrganizationChart,
      route: "/crud/branches",
    },
    {
      name: "Emails",
      description: "Manage Emails",
      reactIcon: MdEmail,
      route: "/crud/emails",
    },
  ];

  // Sort adminActions and crudAdminActions arrays alphabetically by name
  const sortedAdminActions = adminActions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const sortedCrudAdminActions = crudAdminActions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <BatchApproveModal
        isOpen={isBatchApproveOpen}
        onClose={onBatchApproveClose}
      />
      <BatchApproveOldModal
        isOpen={isBatchApproveOldOpen}
        onClose={onBatchApproveOldClose}
      />
      <ProjectLeadEmailModal
        isOpen={isProjectLeadEmailModalOpen}
        onClose={onProjectLeadEmailModalClose}
      />
      <NewCycleModal isOpen={isNewCycleOpen} onClose={onNewCycleClose} />
      <p className={`my-3 font-bold text-lg ${
        colorMode === "light" ? "text-black/70" : "text-white/70"
      }`}>
        Manage
      </p>
      <Separator className="my-4" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedCrudAdminActions.map((action, index) => (
          <AdminOptionBox
            key={index}
            name={action.name}
            description={action.description}
            onClick={() => console.log(action.description)}
            route={action.route}
            reactIcon={action.reactIcon}
          />
        ))}
      </div>
      <p className={`my-3 font-bold text-lg ${
        colorMode === "light" ? "text-black/70" : "text-white/70"
      }`}>
        Actions
      </p>
      <Separator className="my-4" />

      <div className="mt-6 grid grid-cols-2 gap-6">
        {sortedAdminActions.map((action, index) => (
          <AdminOptionBox
            key={index}
            name={action.name}
            description={action.description}
            onClick={action.onClick}
            reactIcon={action.reactIcon}
            // route={action.route}
          />
        ))}
      </div>
    </>
  );
};

interface IAdminOptionBox {
  name: string;
  description: string;
  reactIcon?: IconType;
  onClick: () => void;
  route?: string;
}

const AdminOptionBox = ({
  name,
  // description,
  onClick,
  reactIcon,
  route,
}: IAdminOptionBox) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.03,
      transition: {
        scale: { duration: 0.2 },
      },
    },
  };

  // const [hovered, setHovered] = useState(false);

  const IconComponent = reactIcon;

  const handleOnClick = () => {
    // console.log(route)
    if (route !== undefined && route !== null) {
      navigate(route);
    } else if (!route) {
      onClick();
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      initial="rest"
      style={{ perspective: 1000 }}
    >
      <div
        // onMouseOver={() => setHovered(true)}
        // onMouseLeave={() => setHovered(false)}
        className={`
          rounded-2xl relative overflow-hidden p-8 cursor-pointer flex items-center justify-center
          shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1),0px_2px_3px_-1px_rgba(0,0,0,0.04),-2px_0px_5px_-1px_rgba(0,0,0,0.05),2px_-1px_5px_-1px_rgba(0,0,0,0.05)]
          ${colorMode === "light" 
            ? "bg-white text-gray-500 hover:text-gray-600" 
            : "bg-black/50 text-gray-400 hover:text-gray-200"
          }
        `}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleOnClick}
      >
        {IconComponent && <IconComponent className="w-20 h-20" />}
      </div>
      <div
        className="left-0 bottom-0 p-4 flex flex-col cursor-pointer"
        onClick={handleOnClick}
      >
        <div className="flex items-center justify-center z-[3]">
          <p className={`
            font-semibold select-none line-clamp-2 text-center
            ${colorMode === "light" ? "text-black/70" : "text-white/70"}
          `}>
            {name}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
