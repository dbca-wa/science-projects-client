// AddImageButton.tsx - Fixed implementation
import React, { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Flex,
  Text,
  Image as ChakraImage,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { FaUpload, FaImage } from "react-icons/fa";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "../Plugins/ImagesPlugin";
import { RevisedBaseToolbarButton } from "./RevisedBaseToolbarButton";

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddImageModal = ({ isOpen, onClose }: AddImageModalProps) => {
  const [editor] = useLexicalComposerContext();
  const toast = useToast();
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
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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
          toast({
            title: "Preview error",
            description: "Could not generate image preview",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "File read error",
          description: "Could not read the selected file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in file selection:", error);
      toast({
        title: "Error",
        description: "An error occurred processing the file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Error inserting image",
        description: "There was a problem inserting the image",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Image</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex direction="column" gap={4}>
            <Box
              borderWidth="2px"
              borderRadius="md"
              borderStyle="dashed"
              p={6}
              textAlign="center"
              cursor="pointer"
              bg={previewUrl ? "transparent" : "gray.50"}
              onClick={handleUploadButtonClick}
            >
              {previewUrl ? (
                <ChakraImage
                  src={previewUrl}
                  alt="Preview"
                  maxH="200px"
                  mx="auto"
                />
              ) : (
                <Flex direction="column" alignItems="center" gap={2}>
                  <FaUpload size={30} color="gray" />
                  <Text>Click to select an image</Text>
                  <Text fontSize="sm" color="gray.500">
                    PNG, JPG, GIF up to 5MB
                  </Text>
                </Flex>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>

            <FormControl>
              <FormLabel>Alt Text</FormLabel>
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe this image"
              />
              <FormHelperText>Helps with accessibility</FormHelperText>
            </FormControl>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isUploading}
            isDisabled={!selectedFile}
            onClick={handleInsertUploadedImage}
          >
            Insert Image
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const AddImageButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <AddImageModal isOpen={isOpen} onClose={onClose} />
      <Box className="tooltip-container">
        <RevisedBaseToolbarButton
          buttonSize="sm"
          ariaLabel="Insert Image"
          variant="ghost"
          isDisabled={false}
          onClick={onOpen}
        >
          <FaImage />
        </RevisedBaseToolbarButton>
        <Text className="tooltip-text">Insert Image</Text>
      </Box>
    </>
  );
};

export default AddImageButton;
