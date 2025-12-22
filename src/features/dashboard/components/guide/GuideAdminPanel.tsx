import React, { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  createGuideSection,
  updateGuideSection,
  deleteGuideSection,
  addContentField,
  updateContentField,
  deleteContentField,
  GuideSection,
  ContentField,
} from "@/features/admin/services/admin.service";
import { GuideRichTextEditor } from "@/shared/components/RichTextEditor/Editors/GuideRichTextEditor";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Plus, Trash2, Edit, X, Settings } from "lucide-react";

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
const GuideSectionForm: React.FC<GuideSectionFormProps> = ({
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

  const handleSwitchChange = (checked: boolean, name: string) => {
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

  const removeField = (index: number) => {
    const newFields = [...contentFields];
    const fieldToRemove = newFields[index];

    // If the field has an ID (meaning it exists in the database), delete it immediately
    if (fieldToRemove.id) {
      setIsLoading(true);
      deleteContentField(fieldToRemove.id)
        .then(() => {
          toast.success("Field deleted");
        })
        .catch((error) => {
          toast.error(error.message || "Could not delete field");

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Guide Section" : "Create Guide Section"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="fields">Content Fields ({contentFields.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Section Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={section.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Login Guide"
                  required
                />
              </div>

              <div>
                <Label htmlFor="id">Section ID</Label>
                <Input
                  id="id"
                  name="id"
                  value={section.id}
                  onChange={handleInputChange}
                  placeholder="e.g., login_guide (auto-generated if empty)"
                  readOnly={isEditing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier used in URLs and code. Auto-generated if empty.
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <div className="flex gap-2">
                  <Select
                    value={section.category}
                    onValueChange={(value) => setSection(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Category</SelectItem>
                      {existingCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={addCustomCategory}>Add</Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-divider"
                  checked={section.show_divider_after}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "show_divider_after")}
                />
                <Label htmlFor="show-divider">Show Divider After</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={section.is_active}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "is_active")}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="mb-4">
              <Button onClick={addField} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Content Field
              </Button>
            </div>

            {contentFields.length === 0 ? (
              <p className="text-gray-500">
                No content fields added yet. Add at least one field.
              </p>
            ) : (
              <div className="space-y-4">
                {contentFields.map((field, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-md shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-sm font-medium">Field {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`field-key-${index}`}>Field Key</Label>
                        <Input
                          id={`field-key-${index}`}
                          value={field.field_key}
                          onChange={(e) =>
                            updateField(index, { field_key: e.target.value })
                          }
                          placeholder="e.g., login_instructions"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Unique identifier for this field
                        </p>
                      </div>

                      <div>
                        <Label htmlFor={`field-title-${index}`}>Display Title</Label>
                        <Input
                          id={`field-title-${index}`}
                          value={field.title || ""}
                          onChange={(e) =>
                            updateField(index, { title: e.target.value })
                          }
                          placeholder="e.g., Login Instructions"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`field-description-${index}`}>Description</Label>
                        <Textarea
                          id={`field-description-${index}`}
                          value={field.description || ""}
                          onChange={(e) =>
                            updateField(index, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Brief description of what this field is for"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!section.title || contentFields.length === 0}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

const ContentEditor: React.FC<ContentEditorProps> = ({
  isOpen,
  onClose,
  section,
  field,
  adminOptionsPk,
  currentContent,
  refetch,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {field.title || field.field_key}</SheetTitle>
        </SheetHeader>

        <div className="py-4">
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
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Main Admin Panel Component
interface GuideAdminPanelProps {
  guideSections: GuideSection[];
  adminOptionsPk: number;
  refetch: () => void;
  adminOptionsData: any;
}

const GuideAdminPanel: React.FC<GuideAdminPanelProps> = ({
  guideSections,
  adminOptionsPk,
  refetch,
  adminOptionsData,
}) => {
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<GuideSection | null>(null);
  const [selectedField, setSelectedField] = useState<ContentField | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Get unique categories
  const categories = Array.from(
    new Set(
      guideSections?.map((section) => section.category).filter(Boolean) || [],
    ),
  );

  const handleCreateSection = (section: GuideSection) => {
    createGuideSection(section)
      .then(() => {
        toast.success("Section created");
        refetch();
      })
      .catch((error) => {
        toast.error(error.message || "Error creating section");
      });
  };

  const handleUpdateSection = (section: GuideSection) => {
    updateGuideSection(section)
      .then(() => {
        toast.success("Section updated");
        refetch();
      })
      .catch((error) => {
        toast.error(error.message || "Error updating section");
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
          toast.success("Section deleted");
          refetch();
        })
        .catch((error) => {
          toast.error(error.message || "Error deleting section");
        });
    }
  };

  const openSectionEditor = (section: GuideSection) => {
    setSelectedSection(section);
    setIsEditing(true);
    setIsSectionFormOpen(true);
  };

  const openContentEditor = (section: GuideSection, field: ContentField) => {
    setSelectedSection(section);
    setSelectedField(field);
    setIsEditorOpen(true);
  };

  const handleNewSection = () => {
    setSelectedSection(null);
    setIsEditing(false);
    setIsSectionFormOpen(true);
  };

  const { colorMode } = useColorMode();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Guide Content Management</h1>
        <Button onClick={handleNewSection} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Section
        </Button>
      </div>

      {guideSections?.length === 0 ? (
        <div className={`p-8 text-center border-2 border-dashed rounded-md ${
          colorMode === "dark" ? "border-gray-600" : "border-gray-300"
        }`}>
          <p className="text-lg mb-4">No guide sections created yet</p>
          <Button onClick={handleNewSection} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Section
          </Button>
        </div>
      ) : (
        <div>
          {guideSections?.map((section) => (
            <div
              key={section.id}
              className={`mb-6 p-4 border rounded-md shadow-sm ${
                colorMode === "dark" ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {section.title}
                    {!section.is_active && (
                      <span className="text-sm ml-2 text-gray-500">
                        (Inactive)
                      </span>
                    )}
                  </h2>
                  {section.category && (
                    <p className="text-sm text-gray-500">
                      Category: {section.category}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSectionEditor(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Content Fields:</p>
                {section.content_fields?.length > 0 ? (
                  <div className="space-y-3">
                    {section.content_fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div
                          key={field.id || field.field_key}
                          className={`p-3 border rounded-md flex justify-between items-center ${
                            colorMode === "dark" ? "border-gray-600" : "border-gray-200"
                          }`}
                        >
                          <div>
                            <p className="font-bold">
                              {field.title || field.field_key}
                            </p>
                            {field.description && (
                              <p className="text-sm text-gray-600">
                                {field.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openContentEditor(section, field)}
                          >
                            Edit Content
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No content fields defined</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Form Modal */}
      {isSectionFormOpen && (
        <GuideSectionForm
          isOpen={isSectionFormOpen}
          onClose={() => setIsSectionFormOpen(false)}
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
          onClose={() => setIsEditorOpen(false)}
          section={selectedSection}
          field={selectedField}
          adminOptionsPk={adminOptionsPk}
          currentContent={
            adminOptionsData?.guide_content?.[selectedField.field_key] || ""
          }
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default GuideAdminPanel;
