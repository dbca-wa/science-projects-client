// Handles Profile Page view

import ScienceStaffSearchResult from "@/features/staff-profiles/components/Staff/All/ScienceStaffSearchResult";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiFillCloseCircle, AiFillEdit, AiFillEye } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import { useUser } from "@/features/users/hooks/useUser";
import { EditMembershipModal } from "@/features/users/components/modals/EditMembershipModal";
import { EditPersonalInformationModal } from "@/features/users/components/modals/EditPersonalInformationModal";
import { EditProfileModal } from "@/features/users/components/modals/EditProfileModal";
import { UserGridItem } from "@/features/users/components/UserGridItem";
import { IoIosSave } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { type IUpdatePublicEmail, updatePublicEmail } from "@/features/users/services/users.service";
import { AxiosError } from "axios";
import ToggleStaffProfileVisibilityModal from "@/features/staff-profiles/components/modals/ToggleStaffProfileVisibilityModal";
import PublicEmailSection from "./PublicEmailSection";
import CustomTitleSection from "./CustomTitleSection";

const AnimatedClickToEdit = () => {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: "100%",
        animation: "ease-in-out infinite",
      }}
    >
      <p className="text-blue-500">Click to edit</p>
    </motion.div>
  );
};

export const ProfilePage = () => {
  const { userLoading: loading, userData: me, refetchUser } = useUser();
  const VITE_PRODUCTION_PROFILES_BASE_URL = import.meta.env
    .VITE_PRODUCTION_PROFILES_BASE_URL;
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  const replaceLightWithDark = (htmlString: string): string => {
    // Replace 'light' with 'dark' in class attributes
    const modifiedHTML = htmlString.replace(
      /class\s*=\s*["']([^"']*light[^"']*)["']/gi,
      (match, group) => `class="${group.replace(/\blight\b/g, "dark")}"`,
    );

    // Add margin-right: 4px to all <li> elements (or modify as needed)
    const finalHTML = modifiedHTML.replace(
      /<li/g,
      '<li style="margin-right: 4px;"',
    );

    return finalHTML;
  };

  const replaceDarkWithLight = (htmlString: string): string => {
    // Replace 'dark' with 'light' in class attributes
    const modifiedHTML = htmlString.replace(
      /class\s*=\s*["']([^"']*dark[^"']*)["']/gi,
      (match, group) => {
        return `class="${group.replace(/\bdark\b/g, "light")}"`;
      },
    );

    // Add margin-right: 4px to all <li> elements
    const finalHTML = modifiedHTML.replace(
      /<li/g,
      '<li style="margin-left: 36px;"',
    );

    return finalHTML;
  };

  const sanitizeHtml = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const elements = doc.body.querySelectorAll("*");

    elements.forEach((element) => {
      if (
        element.tagName.toLowerCase() === "b" ||
        element.tagName.toLowerCase() === "strong"
      ) {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      } else {
        element.removeAttribute("style"); // Keep class if necessary for layout
      }
    });

    return doc.body.innerHTML;
  };

  // useEffect(() => {
  //   if (!loading) {
  //     console.log(me);
  //   }
  // }, [me, loading]);
  const NoDataText = "--";

  const { colorMode } = useColorMode();
  const borderColor = colorMode === "light" ? "border-gray-300" : "border-gray-500";
  const sectionTitleColor = colorMode === "light" ? "text-gray-800" : "text-gray-300";
  const subsectionTitleColor = "text-gray-500";

  const [isEditPersonalInformationModalOpen, setIsEditPersonalInformationModalOpen] = useState(false);
  const onOpenEditPersonalInformationModal = () => setIsEditPersonalInformationModalOpen(true);
  const onCloseEditPersonalInformationModal = () => setIsEditPersonalInformationModalOpen(false);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const onOpenEditProfileModal = () => setIsEditProfileModalOpen(true);
  const onCloseEditProfileModal = () => setIsEditProfileModalOpen(false);

  const [isEditMembershipModalOpen, setIsEditMembershipModalOpen] = useState(false);
  const onOpenEditMembershipModal = () => setIsEditMembershipModalOpen(true);
  const onCloseEditMembershipModal = () => setIsEditMembershipModalOpen(false);

  const [isToggleStaffProfileVisibilityModalOpen, setIsToggleStaffProfileVisibilityModalOpen] = useState(false);
  const onOpenToggleStaffProfileVisibilityModal = () => setIsToggleStaffProfileVisibilityModalOpen(true);
  const onCloseToggleStaffProfileVisibilityModal = () => setIsToggleStaffProfileVisibilityModalOpen(false);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMouseEnter = (itemName: string) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const imageUrl = useServerImageUrl(me?.image?.file);
  const navigate = useNavigate();
  const setHref = (url: string) => {
    window.location.href = url;
  };

  // useEffect(() => {
  //   console.log(me);
  // }, [me]);

  return (
    <div className="h-full">
      {loading || me.pk === undefined ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <EditPersonalInformationModal
            userId={`${me.pk}`}
            isOpen={isEditPersonalInformationModalOpen}
            onClose={onCloseEditPersonalInformationModal}
          />

          <EditProfileModal
            userId={`${me.pk}`}
            isOpen={isEditProfileModalOpen}
            onClose={onCloseEditProfileModal}
            currentImage={`${me.image?.file}`}
          />

          <EditMembershipModal
            currentOrganisationData={`${me?.agency?.pk}`}
            currentBranchData={me?.branch}
            currentBaData={me?.business_area}
            currentAffiliationData={me?.affiliation}
            userId={me.pk}
            isOpen={isEditMembershipModalOpen}
            onClose={onCloseEditMembershipModal}
          />

          <ToggleStaffProfileVisibilityModal
            userPk={me?.pk}
            isOpen={isToggleStaffProfileVisibilityModalOpen}
            onClose={onCloseToggleStaffProfileVisibilityModal}
            staffProfilePk={me?.staff_profile_pk}
            profileIsHidden={me?.staff_profile_hidden}
            refetch={refetchUser}
          />

          {/* ACCESS PUBLIC PROFILE */}
          {
            // me?.is_superuser ? (
            <div
              className={`border rounded-xl ${borderColor} p-4 mb-4 flex flex-col cursor-pointer hover:scale-105 transition-transform duration-200`}
              style={{
                boxShadow: colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)"
              }}
              onMouseEnter={() => handleMouseEnter("public appearance")}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <p className={`font-bold text-lg mb-1 ${sectionTitleColor}`}>
                    Public Appearance
                  </p>
                  <div className="mb-2">
                    <p className="text-gray-500 text-sm">
                      View and edit how your staff profile appears to the public
                    </p>
                  </div>
                </div>

                <div className="flex justify-end w-full flex-col">
                  {/* View Public Profile Button */}

                  {/* Edit/View */}
                  <div className="flex justify-end items-center w-full py-4">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        if (import.meta.env.MODE === "development") {
                          navigate(`/staff/${me?.pk}`);
                        } else {
                          setHref(
                            `${VITE_PRODUCTION_PROFILES_BASE_URL}staff/${me?.pk}`,
                          );
                        }
                      }}
                    >
                      <AiFillEdit className="mr-2" />
                      Edit Public Profile
                    </Button>
                  </div>

                  {/* Set Profile to Hidden */}
                  <div className="flex justify-end items-center w-full py-2">
                    <Button
                      variant="outline"
                      onClick={onOpenToggleStaffProfileVisibilityModal}
                    >
                      <AiFillEye className="mr-2" />
                      {me?.staff_profile_hidden
                        ? "Show Staff Profile"
                        : "Hide Staff Profile"}
                    </Button>
                  </div>
                </div>
              </div>
              <PublicEmailSection me={me} />
              <CustomTitleSection me={me} />
            </div>
            // ) : null
          }

          {/* IN APP APPEARANCE */}
          <div
            className={`border rounded-xl ${borderColor} p-4 mb-4 flex flex-col cursor-pointer hover:scale-105 transition-transform duration-200`}
            style={{
              boxShadow: colorMode === "light"
                ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)"
            }}
            onMouseEnter={() => handleMouseEnter("spms appearance")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex">
              <p className={`font-bold text-lg mb-1 ${sectionTitleColor}`}>
                In-App Search Appearance
              </p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-xs">
                This is how your account will appear when searched within SPMS
              </p>
            </div>
            <div className="flex">
              <div className="w-full p-2">
                <div className="w-full">
                  <UserGridItem
                    pk={me.pk}
                    username={me.username}
                    email={me.email}
                    first_name={me.first_name}
                    last_name={me.last_name}
                    display_first_name={me.display_first_name}
                    display_last_name={me.display_last_name}
                    is_staff={me.is_staff}
                    is_superuser={me.is_superuser}
                    image={me.image}
                    business_area={me.business_area}
                    role={me.role}
                    branch={me.branch}
                    is_active={me.is_active}
                    affiliation={me.affiliation}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div
            className={`border rounded-xl ${borderColor} p-4 flex flex-col mb-4 cursor-pointer hover:scale-105 transition-transform duration-200`}
            style={{
              boxShadow: colorMode === "light"
                ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)"
            }}
            onClick={onOpenEditPersonalInformationModal}
            onMouseEnter={() => handleMouseEnter("personal information")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex">
              <div className="flex">
                <p className={`font-bold text-lg mb-1 ${sectionTitleColor}`}>
                  Personal Information
                </p>
              </div>
              {hoveredItem === "personal information" && (
                <div className="flex flex-1 justify-end items-center px-4">
                  <AnimatedClickToEdit />
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs">
                Optionally adjust these details for in-app and PDF display
                (including annual report). Your email cannot be changed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* REPLACED WITH DISPLAY FIRST_NAME SO OIM SSO STILL WORKS BUT NAMES EDITABLE */}
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  First Name
                </p>
                <p>{me.display_first_name ?? me.first_name}</p>
              </div>
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Last Name
                </p>
                <p>{me.display_last_name ?? me.last_name}</p>
              </div>
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Phone
                </p>
                <p>{me.phone ? me.phone : "--"}</p>
              </div>
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Fax
                </p>
                <p>{me.fax ? me.fax : "--"}</p>
              </div>
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Title
                </p>
                <p>
                  {me.title
                    ? me.title === "mr"
                      ? "Mr"
                      : me.title === "mrs"
                        ? "Mrs"
                        : me.title === "ms"
                          ? "Ms"
                          : me.title === "aprof"
                            ? "A/Prof"
                            : me.title === "prof"
                              ? "Prof"
                              : me.title === "dr"
                                ? "Dr"
                                : "Bad Title"
                    : "--"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Email Address
                </p>
                <p>{me.email}</p>
              </div>
            </div>
          </div>

          {/* PROFILE */}
          <div
            className={`border rounded-xl ${borderColor} p-4 flex flex-col mb-4 cursor-pointer hover:scale-105 transition-transform duration-200`}
            style={{
              boxShadow: colorMode === "light"
                ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)"
            }}
            onClick={onOpenEditProfileModal}
            onMouseEnter={() => handleMouseEnter("profile")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex">
              <div className="flex">
                <p className={`font-bold text-lg mb-1 ${sectionTitleColor}`}>
                  Profile
                </p>
              </div>
              {hoveredItem === "profile" && (
                <div className="flex flex-1 justify-end items-center px-4">
                  <AnimatedClickToEdit />
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs">
                Adjust these details for in-app and public display. In uploading
                an image of your self, you are consenting to its use in your
                public profile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Image {!imageUrl ? "(Not Provided)" : ""}
                </p>
                {imageUrl ? (
                  <div className="w-full max-h-[300px] bg-gray-50 mt-1 rounded-lg overflow-hidden flex justify-center items-center">
                    <img
                      className="object-cover select-none"
                      src={imageUrl}
                      alt="Profile"
                    />
                  </div>
                ) : (
                  <div className="w-full max-h-[300px] bg-gray-50 mt-1 rounded-lg overflow-hidden flex justify-center items-center">
                    <img
                      className="object-cover select-none"
                      src="/sad-face.png"
                      alt="No profile"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div>
                  <p className={`${subsectionTitleColor} text-sm`}>
                    About
                  </p>
                  <div
                    className="mt-1"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        colorMode === "dark"
                          ? replaceLightWithDark(
                              me?.about === "" ||
                                me?.about === "<p></p>" ||
                                me?.about ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.about ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.about ?? "<p>(Not Provided)</p>"),
                            )
                          : replaceDarkWithLight(
                              me?.about === "" ||
                                me?.about === "<p></p>" ||
                                me?.about ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.about ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.about ?? "<p>(Not Provided)</p>"),
                            ),
                      ),
                    }}
                  />
                </div>
                <div className="mt-8">
                  <p className={`${subsectionTitleColor} text-sm`}>
                    Expertise
                  </p>
                  <div
                    className="mt-1"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        colorMode === "dark"
                          ? replaceLightWithDark(
                              me?.expertise === "" ||
                                me?.expertise === "<p></p>" ||
                                me?.expertise ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.expertise ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.expertise ?? "<p>(Not Provided)</p>"),
                            )
                          : replaceDarkWithLight(
                              me?.expertise === "" ||
                                me?.expertise === "<p></p>" ||
                                me?.expertise ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.expertise ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.expertise ?? "<p>(Not Provided)</p>"),
                            ),
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ORGANISATION */}
          <div
            className={`border rounded-xl ${borderColor} p-4 flex flex-col mb-4 cursor-pointer hover:scale-105 transition-transform duration-200`}
            style={{
              boxShadow: colorMode === "light"
                ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)"
            }}
            onClick={onOpenEditMembershipModal}
            onMouseEnter={() => handleMouseEnter("membership")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex">
              <div className="flex">
                <p className={`font-bold text-lg mb-1 ${sectionTitleColor}`}>
                  Membership
                </p>
              </div>
              {hoveredItem === "membership" && (
                <div className="flex flex-1 justify-end items-center px-4">
                  <AnimatedClickToEdit />
                </div>
              )}
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-xs">
                Set your branch and business area for in-app and public display.
                Optionally set an affiliation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className={`${subsectionTitleColor} text-sm`}>
                  Organisation Name
                </p>
                <p>
                  {!me.is_staff
                    ? "External"
                    : me?.agency?.name
                      ? me.agency.name
                      : NoDataText}
                </p>
              </div>
              {me.is_staff && (
                <>
                  <div className="flex flex-col">
                    <p className={`${subsectionTitleColor} text-sm`}>
                      Branch
                    </p>
                    <p>
                      {me?.branch?.name ? me?.branch?.name : NoDataText}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className={`${subsectionTitleColor} text-sm`}>
                      Business Area
                    </p>
                    <p>
                      {me?.business_area?.name
                        ? me?.business_area?.name
                        : NoDataText}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className={`${subsectionTitleColor} text-sm`}>
                      Affiliation
                    </p>
                    <p>
                      {me?.affiliation ? me.affiliation?.name : NoDataText}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* STATUS */}
          <div
            className={`mb-4 grid grid-cols-3 rounded-xl gap-3 flex-1 p-4 ${
              colorMode === "light" ? "bg-gray-50" : "bg-gray-900"
            }`}
          >
            <div className="grid grid-cols-1 flex flex-col justify-center items-center">
              <p className="mb-2 font-bold">
                Active?
              </p>
              {me?.is_active ? (
                <div className={colorMode === "light" ? "text-green-500" : "text-green-600"}>
                  <FcApproval />
                </div>
              ) : (
                <div className={colorMode === "light" ? "text-red-500" : "text-red-600"}>
                  <AiFillCloseCircle />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 flex flex-col justify-center items-center">
              <p className="mb-2 font-bold">
                Staff?
              </p>
              {me?.is_staff ? (
                <FcApproval />
              ) : (
                <div className={colorMode === "light" ? "text-red-500" : "text-red-600"}>
                  <AiFillCloseCircle />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 flex flex-col justify-center items-center">
              <p className="mb-2 font-bold">
                Admin?
              </p>
              {me?.is_superuser ? (
                <FcApproval />
              ) : (
                <div className={colorMode === "light" ? "text-red-500" : "text-red-600"}>
                  <AiFillCloseCircle />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
