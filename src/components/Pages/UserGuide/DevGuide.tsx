import { Head } from "@/components/Base/Head";
import { AccountPageViewWrapper } from "@/components/Wrappers/AccountPageViewWrapper";
import { useEditorContext } from "@/lib/hooks/helper/EditorBlockerContext";
import { useAdminOptions } from "@/lib/hooks/tanstack/useAdminOptions";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useGuideSections } from "@/lib/hooks/tanstack/useGuideSections";
import {
  Box,
  Flex,
  useColorMode,
  Text,
  Spinner,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { SettingsIcon, AddIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { SideMenuButton } from "../Account/SideMenuButton";
import { GuideRichTextEditor } from "@/components/RichTextEditor/Editors/GuideRichTextEditor";
import { saveGuideContentToDB } from "@/lib/api";
import GuideAdminPanel from "./GuideAdminPanel"; // Import the admin panel
import { GuideSidebarButton } from "./GuideSidebarButton";
import { GuideSectionDivider } from "./GuideSectionDivider";

// New dynamic section component
const DynamicGuideSection = ({
  isSuperUser,
  section,
  adminOptionsData,
  adminOptionsPk,
  refetch,
  openAdminPanel,
}) => {
  const { colorMode } = useColorMode();

  // Function to save content using the dynamic approach
  const handleSaveContent = async (fieldKey: string, content: string) => {
    try {
      await saveGuideContentToDB({
        fieldKey,
        content,
        adminOptionsPk,
      });
      return true;
    } catch (error) {
      console.error("Error saving content:", error);
      return false;
    }
  };

  if (!section.content_fields || section.content_fields.length === 0) {
    return (
      <Box pr={4}>
        <Text color="gray.500" mb={4}>
          No content fields have been defined for this section.
        </Text>
        {isSuperUser && (
          <Flex direction="column" alignItems="flex-start">
            <Text fontSize="sm" mb={4}>
              Use the settings panel to add content fields to this section.
            </Text>
            <Button
              leftIcon={<SettingsIcon />}
              colorScheme="blue"
              size="sm"
              onClick={openAdminPanel}
            >
              Manage Guide Content
            </Button>
          </Flex>
        )}
      </Box>
    );
  }

  return (
    <Box pr={4}>
      {section.content_fields
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <Box key={field.id} mb={6}>
            <GuideRichTextEditor
              key={`${field.field_key}${colorMode}`}
              canEdit={isSuperUser}
              data={adminOptionsData?.guide_content?.[field.field_key] || ""}
              section={field.field_key}
              fieldTitle={field.title || field.field_key}
              adminOptionsPk={adminOptionsPk}
              isUpdate={true}
              refetch={refetch}
              onSave={(content) =>
                handleSaveContent(field.field_key, content.content)
              }
            />
          </Box>
        ))}
    </Box>
  );
};

// Placeholder section when no content is found
const NoContentSection = ({ isSuperUser, openAdminPanel }) => (
  <Box p={6} textAlign="center">
    <Text fontSize="lg" mb={4}>
      No guide content found for this section.
    </Text>
    {isSuperUser && (
      <>
        <Text fontSize="md" mb={6} color="gray.600">
          You can add content to this section using the guide management panel.
        </Text>
        <Button
          leftIcon={<SettingsIcon />}
          colorScheme="blue"
          onClick={openAdminPanel}
        >
          Open Guide Management
        </Button>
      </>
    )}
  </Box>
);

export const DevGuide = () => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();
  const { colorMode } = useColorMode();
  const { userData, userLoading } = useUser();
  const { adminOptionsData, adminOptionsLoading, refetch } = useAdminOptions(1);

  // Admin panel state
  const {
    isOpen: isAdminPanelOpen,
    onOpen: openAdminPanel,
    onClose: closeAdminPanel,
  } = useDisclosure();

  // Fetch guide sections using the proper hook
  const { guideSections, isLoading: sectionsLoading } = useGuideSections();

  // State for selected section - using string type for flexibility
  const [selected, setSelected] = useState<string>("");
  const [pageViewChildren, setPageViewChildren] = useState<React.ReactNode>();

  // Set initial selection once sections are loaded
  useEffect(() => {
    if (guideSections?.length > 0 && !selected) {
      // Find the first active section
      const firstActive = guideSections.find((section) => section.is_active);
      if (firstActive) {
        setSelected(firstActive.id);
      } else {
        // Fallback to default if no active sections
        setSelected("default");
      }
    } else if (!selected && !sectionsLoading) {
      // If no sections are loaded and we're not loading, set a default
      setSelected("default");
    }
  }, [guideSections, selected, sectionsLoading]);

  const handleSidebarMenuClick = (page: string) => {
    manuallyCheckAndToggleDialog(() => {
      setSelected(page);
    });
  };

  // Group sections by category for the sidebar
  const groupedSections = guideSections?.reduce((acc, section) => {
    if (!section.is_active) return acc;

    const category = section.category || "default";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(section);
    return acc;
  }, {});

  // Sort categories - "default" (uncategorized) first, then alphabetically
  const sortedCategories = groupedSections
    ? Object.keys(groupedSections).sort((a, b) => {
        if (a === "default") return -1;
        if (b === "default") return 1;
        return a.localeCompare(b);
      })
    : [];

  useEffect(() => {
    if (!userLoading && userData && !adminOptionsLoading && adminOptionsData) {
      let content = null;

      // Try to find the section in dynamic sections
      if (guideSections?.length > 0) {
        const dynamicSection = guideSections.find(
          (section) => section.id === selected,
        );

        if (dynamicSection) {
          content = (
            <DynamicGuideSection
              isSuperUser={userData?.is_superuser}
              section={dynamicSection}
              adminOptionsData={adminOptionsData}
              adminOptionsPk={adminOptionsData.pk}
              refetch={refetch}
              openAdminPanel={openAdminPanel}
            />
          );
        } else {
          // No matching section found
          content = (
            <NoContentSection
              isSuperUser={userData?.is_superuser}
              openAdminPanel={openAdminPanel}
            />
          );
        }
      } else if (!sectionsLoading) {
        // No sections available at all
        content = (
          <Box p={6} textAlign="center">
            <Text fontSize="lg" mb={4}>
              No guide sections have been created yet.
            </Text>
            {userData?.is_superuser && (
              <>
                <Text fontSize="md" mb={6} color="gray.600">
                  As an admin, you can create guide sections using the guide
                  management panel.
                </Text>
                <Button
                  leftIcon={<SettingsIcon />}
                  colorScheme="blue"
                  onClick={openAdminPanel}
                >
                  Manage Guide Content
                </Button>
              </>
            )}
          </Box>
        );
      }

      setPageViewChildren(content);
    }
  }, [
    selected,
    userData,
    userLoading,
    adminOptionsData,
    adminOptionsLoading,
    guideSections,
    sectionsLoading,
    openAdminPanel,
  ]);

  // Show loading state
  if (userLoading || adminOptionsLoading || sectionsLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Head title="Dev Guide" />
      <Flex h={"100%"} w={"100%"}>
        {/* Content */}
        <AccountPageViewWrapper children={pageViewChildren} />

        {/* Sidebar */}
        <Box
          borderLeftWidth="1px"
          borderLeftColor={
            colorMode === "light" ? "gray.300" : "whiteAlpha.400"
          }
          px={2}
          h={"100%"}
          // w={"100%"}
        >
          {/* Admin Controls for Superusers */}
          {userData?.is_superuser && (
            <Box mb={4} mt={2} textAlign="center">
              <Button
                leftIcon={<SettingsIcon />}
                colorScheme="blue"
                size="sm"
                width="90%"
                onClick={openAdminPanel}
              >
                Manage Guide
              </Button>
            </Box>
          )}

          {/* Render dynamic sections if available */}
          {guideSections && guideSections.length > 0 ? (
            // Render sections grouped by category
            sortedCategories.map((category) => (
              <Box key={category} w={"full"}>
                {/* Show category name if it's not the default category */}
                {category !== "default" && (
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                    px={2}
                    py={1}
                  >
                    {category}
                  </Text>
                )}

                {/* Render sections in this category */}
                {groupedSections[category]
                  .sort((a, b) => a.order - b.order)
                  .map((section, index, array) => (
                    <Box key={section.id}>
                      <GuideSidebarButton
                        pageName={section.title}
                        selectedString={selected}
                        onClick={() => handleSidebarMenuClick(section.id)}
                      />
                      {section.show_divider_after && <GuideSectionDivider />}
                      {/* Add divider after the last item in a category if it's not the last category */}
                      {index === array.length - 1 &&
                        category !==
                          sortedCategories[sortedCategories.length - 1] && (
                          <GuideSectionDivider />
                        )}
                    </Box>
                  ))}
              </Box>
            ))
          ) : (
            // Message when no sections exist
            <Box p={4} textAlign="center">
              <Text color="gray.500" fontSize="sm" mb={4}>
                No guide sections available
              </Text>
              {userData?.is_superuser && (
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={openAdminPanel}
                >
                  Create Sections
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Flex>

      {/* Admin Panel Drawer */}
      <Drawer
        isOpen={isAdminPanelOpen}
        placement="right"
        onClose={closeAdminPanel}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Guide Management</DrawerHeader>
          <DrawerBody>
            <GuideAdminPanel
              guideSections={guideSections || []}
              adminOptionsPk={adminOptionsData?.pk || 1}
              refetch={() => {
                refetch();
                // Also refetch guide sections
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
              adminOptionsData={adminOptionsData}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DevGuide;
