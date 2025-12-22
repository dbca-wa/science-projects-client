// AddImageButton.tsx - Fixed implementation
import React, { useState, useRef } from "react";
import { FaUpload, FaImage } from "react-icons/fa";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "../Plugins/ImagesPlugin";
import { RevisedBaseToolbarButton } from "./RevisedBaseToolbarButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddImageModal = ({ isOpen, onClose }: AddImageModalProps) => {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when modal is closed
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
    onClose();
  };

  // Handle file selection with better error handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Please select an image smaller than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image file");
        return;
      }

      setSelectedFile(file);
      setAltText(file.name.split(".")[0] || "Image"); // Use filename as default alt text

      // Create preview with error handling
      const reader = new FileReader();

      reader.onload = () => {
        try {
          setPreviewUrl(reader.result as string);
        } catch (error) {
          console.error("Error setting preview URL:", error);
          toast.error("Could not generate image preview");
        }
      };

      reader.onerror = () => {
        toast.error("Could not read the selected file");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in file selection:", error);
      toast.error("An error occurred processing the file");
    }
  };

  // Handle file upload button click
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Insert uploaded image into editor - simplified approach
  const handleInsertUploadedImage = async () => {
    if (!selectedFile || !previewUrl) return;

    try {
      setIsUploading(true);

      // Simple direct insertion without image dimension calculation
      // This avoids potential crashes from the img onload handler
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: previewUrl,
        altText: altText || selectedFile.name,
        // Set a reasonable default width instead of calculating
        width: 400, // Reasonable default width
      });

      // Close modal and reset state
      handleClose();
    } catch (error) {
      console.error("Error inserting image:", error);
      toast.error("There was a problem inserting the image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
              previewUrl ? "bg-transparent" : "bg-muted/50"
            }`}
            onClick={handleUploadButtonClick}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaUpload size={30} className="text-muted-foreground" />
                <p>Click to select an image</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image"
            />
            <p className="text-sm text-muted-foreground">
              Helps with accessibility
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedFile || isUploading}
            onClick={handleInsertUploadedImage}
          >
            {isUploading ? "Inserting..." : "Insert Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddImageButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AddImageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="tooltip-container">
        <RevisedBaseToolbarButton
          buttonSize="sm"
          ariaLabel="Insert Image"
          variant="ghost"
          isDisabled={false}
          onClick={() => setIsOpen(true)}
        >
          <FaImage />
        </RevisedBaseToolbarButton>
        <span className="tooltip-text">Insert Image</span>
      </div>
    </>
  );
};

export default AddImageButton;
