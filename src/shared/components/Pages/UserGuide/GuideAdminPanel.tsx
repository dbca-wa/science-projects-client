import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  createGuideSection,
  updateGuideSection,
  deleteGuideSection,
  addContentField,
  updateContentField,
  deleteContentField,
  GuideSection,
  ContentField,
} from "@/shared/lib/api";
import { GuideRichTextEditor } from "@/shared/components/RichTextEditor/Editors/GuideRichTextEditor";

// Types
// interface ContentField {
//   id?: string;
//   title?: string;
//   field_key: string;
//   description?: string;
//   order: number;
// }

// interface GuideSection {
//   id: string;
//   title: string;
//   order: number;
//   show_divider_after: boolean;
//   category?: string;
//   is_active: boolean;
//   content_fields: ContentField[];
// }

interface GuideSectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GuideSection;
  isEditing: boolean;
  onSubmit: (section: GuideSection) => void;
  existingCategories: string[];
}

// Form for creating/editing guide sections
const GuideSectionForm: FC<GuideSectionFormProps> = ({
  isOpen,
  onClose,
  initialData,
  isEditing,
  onSubmit,
  existingCategories,
}) => {
  const [section, setSection] = useState<GuideSection>({
    id: "",
    title: "",
    order: 0,
    show_divider_after: false,
    category: "",
    is_active: true,
    content_fields: [],
  });

  const [contentFields, setContentFields] = useState<ContentField[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (initialData) {
      setSection(initialData);
      setContentFields(initialData.content_fields || []);
    } else {
      setSection({
        id: "",
        title: "",
        order: 0,
        show_divider_after: false,
        category: "",
        is_active: true,
        content_fields: [],
      });
      setContentFields([]);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSection((prev) => ({ ...prev, [name]: checked }));
  };

  const addField = () => {
    //@ts-ignore
    const newField: ContentField = {
      field_key: `${section.id}_field_${contentFields.length + 1}`,
      title: `Field ${contentFields.length + 1}`,
      description: "",
      order: contentFields.length,
    };
    setContentFields([...contentFields, newField]);
  };

  const updateField = (index: number, field: Partial<ContentField>) => {
    const newFields = [...contentFields];
    newFields[index] = { ...newFields[index], ...field };
    setContentFields(newFields);
  };

  //   const removeField = (index: number) => {
  //     const newFields = [...contentFields];
  //     newFields.splice(index, 1);
  //     // Update order
  //     newFields.forEach((field, idx) => {
  //       field.order = idx;
  //     });
  //     setContentFields(newFields);
  //   };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();

  const removeField = (index: number) => {
    const newFields = [...contentFields];
    const fieldToRemove = newFields[index];

    // If the field has an ID (meaning it exists in the database), delete it immediately
    if (fieldToRemove.id) {
      setIsLoading(true);
      deleteContentField(fieldToRemove.id)
        .then(() => {
          toast({
            title: "Field deleted",
            status: "success",
            duration: 3000,
          });
        })
        .catch((error) => {
          toast({
            title: "Error deleting field",
            description: error.message || "Could not delete field",
            status: "error",
            duration: 5000,
          });

          // If deletion fails, keep the field in the UI
          // This provides visual feedback that something went wrong
          return;
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    // Remove from local state
    newFields.splice(index, 1);

    // Update order
    newFields.forEach((field, idx) => {
      field.order = idx;
    });

    setContentFields(newFields);
  };

  const handleSubmit = () => {
    // Generate an ID if creating new
    const finalSection = {
      ...section,
      id: section.id || section.title.toLowerCase().replace(/\s+/g, "_"),
      content_fields: contentFields,
    };
    onSubmit(finalSection);
    onClose();
  };

  const addCustomCategory = () => {
    if (newCategory.trim()) {
      setSection((prev) => ({ ...prev, category: newCategory.trim() }));
      setNewCategory("");
    }
  };
  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent color={colorMode === "dark" ? "gray.400" : null}>
        <ModalHeader>
          {isEditing ? "Edit Guide Section" : "Create Guide Section"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Basic Info</Tab>
              <Tab>Content Fields ({contentFields.length})</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="start">
                  <FormControl isRequired>
                    <FormLabel>Section Title</FormLabel>
                    <Input
                      name="title"
                      value={section.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Login Guide"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Section ID</FormLabel>
                    <Input
                      name="id"
                      value={section.id}
                      onChange={handleInputChange}
                      placeholder="e.g., login_guide (auto-generated if empty)"
                      isReadOnly={isEditing}
                    />
                    <Text fontSize="xs" color="gray.500">
                      Unique identifier used in URLs and code. Auto-generated if
                      empty.
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <HStack>
                      <Select
                        name="category"
                        value={section.category}
                        onChange={handleInputChange}
                        placeholder="Select or type a category"
                      >
                        <option value="">No Category</option>
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Select>
                      <Input
                        placeholder="New category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <Button onClick={addCustomCategory}>Add</Button>
                    </HStack>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="show-divider" mb="0">
                      Show Divider After
                    </FormLabel>
                    <Switch
                      id="show-divider"
                      name="show_divider_after"
                      isChecked={section.show_divider_after}
                      onChange={handleSwitchChange}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="is-active" mb="0">
                      Active
                    </FormLabel>
                    <Switch
                      id="is-active"
                      name="is_active"
                      isChecked={section.is_active}
                      onChange={handleSwitchChange}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              <TabPanel>
                <Box mb={4}>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={addField}
                  >
                    Add Content Field
                  </Button>
                </Box>

                {contentFields.length === 0 ? (
                  <Text color="gray.500">
                    No content fields added yet. Add at least one field.
                  </Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {contentFields.map((field, index) => (
                      <Box
                        key={index}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Flex justify="space-between" mb={2}>
                          <Heading size="sm">Field {index + 1}</Heading>
                          <IconButton
                            aria-label="Remove field"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => removeField(index)}
                          />
                        </Flex>

                        <FormControl mb={2}>
                          <FormLabel>Field Key</FormLabel>
                          <Input
                            value={field.field_key}
                            onChange={(e) =>
                              updateField(index, { field_key: e.target.value })
                            }
                            placeholder="e.g., login_instructions"
                          />
                          <Text fontSize="xs" color="gray.500">
                            Unique identifier for this field
                          </Text>
                        </FormControl>

                        <FormControl mb={2}>
                          <FormLabel>Display Title</FormLabel>
                          <Input
                            value={field.title || ""}
                            onChange={(e) =>
                              updateField(index, { title: e.target.value })
                            }
                            placeholder="e.g., Login Instructions"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            value={field.description || ""}
                            onChange={(e) =>
                              updateField(index, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Brief description of what this field is for"
                          />
                        </FormControl>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={!section.title || contentFields.length === 0}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Content Editor Component
interface ContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  section: GuideSection;
  field: ContentField;
  adminOptionsPk: number;
  currentContent: string;
  refetch: () => void;
}

const ContentEditor: FC<ContentEditorProps> = ({
  isOpen,
  onClose,
  section,
  field,
  adminOptionsPk,
  currentContent,
  refetch,
}) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit {field.title || field.field_key}</DrawerHeader>

        <DrawerBody>
          <GuideRichTextEditor
            canEdit={true}
            data={currentContent || ""}
            section={field.field_key}
            fieldTitle={field.title}
            adminOptionsPk={adminOptionsPk}
            isUpdate={true}
            refetch={() => {
              refetch();
              onClose();
            }}
          />
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

// Main Admin Panel Component
interface GuideAdminPanelProps {
  guideSections: GuideSection[];
  adminOptionsPk: number;
  refetch: () => void;
  adminOptionsData: any;
}

const GuideAdminPanel: FC<GuideAdminPanelProps> = ({
  guideSections,
  adminOptionsPk,
  refetch,
  adminOptionsData,
}) => {
  const {
    isOpen: isSectionFormOpen,
    onOpen: openSectionForm,
    onClose: closeSectionForm,
  } = useDisclosure();
  const {
    isOpen: isEditorOpen,
    onOpen: openEditor,
    onClose: closeEditor,
  } = useDisclosure();
  const [selectedSection, setSelectedSection] = useState<GuideSection | null>(
    null,
  );
  const [selectedField, setSelectedField] = useState<ContentField | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  // Get unique categories
  const categories = Array.from(
    new Set(
      guideSections?.map((section) => section.category).filter(Boolean) || [],
    ),
  );

  const handleCreateSection = (section: GuideSection) => {
    createGuideSection(section)
      .then(() => {
        toast({
          title: "Section created",
          status: "success",
          duration: 3000,
        });
        refetch();
      })
      .catch((error) => {
        toast({
          title: "Error creating section",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      });
  };

  const handleUpdateSection = (section: GuideSection) => {
    updateGuideSection(section)
      .then(() => {
        toast({
          title: "Section updated",
          status: "success",
          duration: 3000,
        });
        refetch();
      })
      .catch((error) => {
        toast({
          title: "Error updating section",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? This will delete all content fields within it.",
      )
    ) {
      deleteGuideSection(sectionId)
        .then(() => {
          toast({
            title: "Section deleted",
            status: "success",
            duration: 3000,
          });
          refetch();
        })
        .catch((error) => {
          toast({
            title: "Error deleting section",
            description: error.message,
            status: "error",
            duration: 5000,
          });
        });
    }
  };

  const openSectionEditor = (section: GuideSection) => {
    setSelectedSection(section);
    setIsEditing(true);
    openSectionForm();
  };

  const openContentEditor = (section: GuideSection, field: ContentField) => {
    setSelectedSection(section);
    setSelectedField(field);
    openEditor();
  };

  const handleNewSection = () => {
    setSelectedSection(null);
    setIsEditing(false);
    openSectionForm();
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Guide Content Management</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleNewSection}
        >
          Create New Section
        </Button>
      </Flex>

      {guideSections?.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          borderWidth={1}
          borderRadius="md"
          borderStyle="dashed"
        >
          <Text fontSize="lg" mb={4}>
            No guide sections created yet
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleNewSection}
          >
            Create Your First Section
          </Button>
        </Box>
      ) : (
        <Box>
          {guideSections?.map((section) => (
            <Box
              key={section.id}
              mb={6}
              p={4}
              borderWidth={1}
              borderRadius="md"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading size="md">
                    {section.title}
                    {!section.is_active && (
                      <Text as="span" fontSize="sm" ml={2} color="gray.500">
                        (Inactive)
                      </Text>
                    )}
                  </Heading>
                  {section.category && (
                    <Text fontSize="sm" color="gray.500">
                      Category: {section.category}
                    </Text>
                  )}
                </Box>
                <HStack>
                  <IconButton
                    aria-label="Edit section"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => openSectionEditor(section)}
                  />
                  <IconButton
                    aria-label="Delete section"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteSection(section.id)}
                  />
                </HStack>
              </Flex>

              <Box>
                <Text fontWeight="medium" mb={2}>
                  Content Fields:
                </Text>
                {section.content_fields?.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    {section.content_fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <Flex
                          key={field.id || field.field_key}
                          p={3}
                          borderWidth={1}
                          borderRadius="md"
                          justify="space-between"
                          align="center"
                        >
                          <Box>
                            <Text fontWeight="bold">
                              {field.title || field.field_key}
                            </Text>
                            {field.description && (
                              <Text fontSize="sm" color="gray.600">
                                {field.description}
                              </Text>
                            )}
                          </Box>
                          <Button
                            size="sm"
                            onClick={() => openContentEditor(section, field)}
                          >
                            Edit Content
                          </Button>
                        </Flex>
                      ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No content fields defined</Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Section Form Modal */}
      {isSectionFormOpen && (
        <GuideSectionForm
          isOpen={isSectionFormOpen}
          onClose={closeSectionForm}
          initialData={selectedSection || undefined}
          isEditing={isEditing}
          onSubmit={isEditing ? handleUpdateSection : handleCreateSection}
          existingCategories={categories}
        />
      )}

      {/* Content Editor Drawer */}
      {isEditorOpen && selectedSection && selectedField && (
        <ContentEditor
          isOpen={isEditorOpen}
          onClose={closeEditor}
          section={selectedSection}
          field={selectedField}
          adminOptionsPk={adminOptionsPk}
          currentContent={
            adminOptionsData?.guide_content?.[selectedField.field_key] || ""
          }
          refetch={refetch}
        />
      )}
    </Box>
  );
};

export default GuideAdminPanel;
