import { handleImageFileCompression } from "@/lib/hooks/helper/handleImageFileCompression";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import {
  Box,
  Center,
  Flex,
  Grid,
  Image,
  Progress,
  Text,
  useColorMode,
  Button,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  ButtonGroup,
  IconButton,
  ModalFooter,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState, useRef, useCallback } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { FiEdit, FiSquare, FiMaximize } from "react-icons/fi";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import { MdAspectRatio } from "react-icons/md";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface Props {
  helperText?: string;
  selectedImageUrl: string | null;
  setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
  clearImageAddedFunctionality?: () => void;
  username?: string;
  baseAPI?: string;
}

export const StatefulMediaChangerAvatar = ({
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
  clearImageAddedFunctionality,
  username,
  baseAPI,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // For cropping modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined); // Start with free-form cropping

  // Store the original image URL to be able to revert
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Real-time preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    avatar: string | null;
    profile: string | null;
  }>({ avatar: null, profile: null });

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const [isImageError, setIsImageError] = useState(false);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();
  const baseUrl = useApiEndpoint();

  // Helper function to check if we have a valid image
  const hasValidImage =
    selectedImageUrl &&
    selectedImageUrl !== null &&
    !selectedImageUrl.endsWith("undefined");

  // Function to convert a blob to a file
  const blobToFile = (blob: Blob, fileName: string): File => {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  };

  // Function to set aspect ratio with centered crop
  const setAspectRatio = useCallback((aspectRatio: number | undefined) => {
    setAspect(aspectRatio);

    if (aspectRatio && imgRef.current) {
      const { width, height } = imgRef.current;
      const imageAspect = width / height;
      let cropWidth = 50;
      let cropHeight = 50;

      if (aspectRatio > imageAspect) {
        // If aspect is wider than image, limit by width
        cropWidth = 90;
        cropHeight = 90 / aspectRatio;
      } else {
        // If aspect is taller than image, limit by height
        cropHeight = 90;
        cropWidth = 90 * aspectRatio;
      }

      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: cropWidth,
            height: cropHeight,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );

      setCrop(newCrop);
    }
  }, []);

  // Reset rotation and scale
  const resetTransforms = () => {
    setScale(1);
    setRotate(0);
  };

  // Function to generate a crop preview
  const generateCropPreview = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop, scale = 1, rotate = 0) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return null;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      canvas.width = crop.width * scaleX * pixelRatio;
      canvas.height = crop.height * scaleY * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const rotateRads = (rotate * Math.PI) / 180;

      ctx.save();

      // Move the canvas to the center for rotation
      ctx.translate(
        canvas.width / 2 / pixelRatio,
        canvas.height / 2 / pixelRatio,
      );
      ctx.rotate(rotateRads);
      ctx.translate(
        -canvas.width / 2 / pixelRatio,
        -canvas.height / 2 / pixelRatio,
      );

      // Draw the cropped image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      );

      ctx.restore();

      return new Promise<string>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve(url);
          },
          "image/jpeg",
          0.95,
        );
      });
    },
    [],
  );

  // Update previews when crop changes
  useEffect(() => {
    async function updatePreviews() {
      if (completedCrop && imgRef.current) {
        const previewUrl = await generateCropPreview(
          imgRef.current,
          completedCrop,
          scale,
          rotate,
        );

        if (previewUrl) {
          setPreviewUrls({
            avatar: previewUrl,
            profile: previewUrl,
          });
        }
      }
    }

    updatePreviews();
  }, [completedCrop, scale, rotate, generateCropPreview]);

  // Apply the crop to the image
  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const croppedImageUrl = await generateCropPreview(
      imgRef.current,
      completedCrop,
      scale,
      rotate,
    );

    if (croppedImageUrl) {
      // Convert the blob URL to a blob, then to a file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // Create a new file with the cropped image
      const croppedFile = blobToFile(
        blob,
        selectedFile ? selectedFile.name : "cropped-image.jpg",
      );

      // Update the selected file with the cropped one
      setSelectedFile(croppedFile);

      // Update the image URL to show the cropped version
      setSelectedImageUrl(croppedImageUrl);

      // Clear the previews
      setPreviewUrls({ avatar: null, profile: null });

      onClose();
    }
  };

  // Reset crop to original image
  const resetCrop = () => {
    if (originalImageUrl && originalFile) {
      setSelectedImageUrl(originalImageUrl);
      setSelectedFile(originalFile);
    }
    resetTransforms();
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
    setCompletedCrop(null);
    setPreviewUrls({ avatar: null, profile: null });
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };

  const handleFileSelection = async (files) => {
    if (files && files.length > 0) {
      await onFileDrop([files[0]]);
    }
  };

  const onFileDrop = async (acceptedFile) => {
    handleImageFileCompression({
      acceptedFile: acceptedFile,
      acceptedImageTypes: acceptedImageTypes,
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      setIsErrorFn: setIsError,
      setIsUploadingFn: setIsUploading,
      setSelectedFileFn: setSelectedFile,
      setSelectedImageUrlFn: setSelectedImageUrl,
      setUploadProgressFn: setUploadProgress,
      setProgressIntervalFn: setProgressInterval,
      startSimulatedProgressFn: startSimulatedProgress,
      progressInterval: progressInterval,
    });
  };

  const onDeleteEntry = (e) => {
    e.preventDefault();
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setUploadProgress(0);
    setPreviewUrls({ avatar: null, profile: null });
    setOriginalFile(null);
    setOriginalImageUrl(null);
  };

  // Handler for file input change event
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open the crop modal
  const openCropModal = () => {
    // Store original image for reset functionality
    setOriginalFile(selectedFile);
    setOriginalImageUrl(selectedImageUrl);

    // Reset crop settings when opening modal
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
    resetTransforms();

    onOpen();
  };

  useEffect(() => {
    if (isError) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  }, [isError, progressInterval]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Flex direction="row" w="100%" gap={6}>
        {/* Only show previews if we have an image */}
        {hasValidImage && (
          <Flex
            direction="column"
            gap={4}
            justifyContent="center"
            minWidth="200px"
          >
            {/* Avatar Preview */}
            <Box>
              <Text fontSize="sm" mb={2}>
                SPMS Avatar Preview:
              </Text>
              <Avatar
                size="md"
                name={username || "User"}
                src={
                  selectedImageUrl
                    ? selectedImageUrl?.startsWith("/files")
                      ? `${baseUrl}${selectedImageUrl}`
                      : selectedImageUrl
                    : NoImageFile
                }
              />
            </Box>

            {/* Profile Image Preview */}
            <Box>
              <Text fontSize="sm" mb={2}>
                Staff Profile Preview:
              </Text>
              <Box
                w="150px"
                h="150px"
                borderRadius="lg"
                overflow="hidden"
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
              >
                <img
                  src={
                    selectedImageUrl
                      ? selectedImageUrl?.startsWith("/files")
                        ? `${baseUrl}${selectedImageUrl}`
                        : selectedImageUrl
                      : NoImageFile
                  }
                  alt={`Profile of ${username || "User"}`}
                  className="h-full w-full object-cover"
                  onError={() => setIsImageError(true)}
                />
              </Box>
            </Box>
          </Flex>
        )}

        {/* Upload area - will take all remaining space */}
        <Box
          pos={"relative"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          cursor={isHovered ? "pointer" : undefined}
          flex="1"
        >
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept={acceptedImageTypes.join(",")}
            onChange={handleFileInputChange}
          />

          {isHovered && hasValidImage ? (
            <Box
              bg={"white"}
              padding={4}
              rounded={"full"}
              pos={"absolute"}
              right={4}
              top={4}
              color={isHovered ? "red.500" : "green.500"}
              _hover={{ color: "red.400" }}
              onClick={async (e) => {
                onDeleteEntry(e);
                if (clearImageAddedFunctionality) {
                  console.log("Clearing image");
                  await clearImageAddedFunctionality();
                  console.log("cleared");
                }
              }}
              zIndex={99999}
            >
              <ImCross size={"25px"} />
            </Box>
          ) : null}

          {/* Edit button */}
          {isHovered && hasValidImage ? (
            <Box
              bg={"white"}
              padding={4}
              rounded={"full"}
              pos={"absolute"}
              left={4}
              top={4}
              color={isHovered ? "blue.500" : "green.500"}
              _hover={{ color: "blue.400" }}
              onClick={openCropModal}
              zIndex={99999}
            >
              <FiEdit size={"25px"} />
            </Box>
          ) : null}

          <Dropzone multiple={false} onDrop={onFileDrop}>
            {({ getRootProps, getInputProps }) => {
              // Extract only the dropzone props without the onClick handler
              const { onClick, ...rootProps } = getRootProps();

              return (
                <Box
                  {...rootProps}
                  h={72}
                  width={"100%"}
                  border={"1px dashed"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
                  rounded={"lg"}
                  onClick={(e) => {
                    // Prevent default onClick behavior from Dropzone
                    e.stopPropagation();
                    // Trigger our file input instead
                    triggerFileInput();
                  }}
                >
                  <input {...getInputProps()} />
                  {hasValidImage ? (
                    <Box w={"100%"} h={"100%"} pos={"relative"} rounded={"lg"}>
                      <Box
                        overflow={"hidden"}
                        w={"100%"}
                        h={"100%"}
                        rounded={"lg"}
                      >
                        <Image
                          rounded={"lg"}
                          src={
                            selectedImageUrl
                              ? selectedImageUrl?.startsWith("/files")
                                ? `${baseUrl}${selectedImageUrl}`
                                : selectedImageUrl
                              : NoImageFile
                          }
                          objectFit={"cover"}
                          w={"100%"}
                          h={"100%"}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Flex
                      rounded={"lg"}
                      flexDir={"column"}
                      justifyContent={"center"}
                      justifyItems={"center"}
                      w={"100%"}
                      h={"100%"}
                      background={"blackAlpha.800"}
                      zIndex={3}
                    >
                      <Center
                        flexDir={"column"}
                        justifyContent={"center"}
                        justifyItems={"center"}
                      >
                        <BsCloudArrowUp size={"50px"} color={"white"} />
                      </Center>

                      <Grid
                        flexDir={"column"}
                        alignItems={"center"}
                        textAlign={"center"}
                        color={"white"}
                      >
                        <Text px={8} textAlign={"center"}>
                          {`${helperText || "Click or drop image here"}`}
                        </Text>
                      </Grid>

                      {isUploading ? (
                        <Center w={"100%"} mt={4} maxW={"xs"} mx={"auto"}>
                          <Box w={"80%"} h={1} px={1}>
                            <Progress
                              bg={
                                colorMode === "light" ? "gray.200" : "gray.900"
                              }
                              colorScheme={
                                uploadProgress === 100 && selectedFile
                                  ? "green"
                                  : "blue"
                              }
                              size={"xs"}
                              value={uploadProgress}
                            />
                          </Box>
                        </Center>
                      ) : null}

                      {isError ? (
                        <Center>
                          <Text color={"red.500"} mt={4}>
                            That file is not of the correct type
                          </Text>
                        </Center>
                      ) : null}
                    </Flex>
                  )}
                </Box>
              );
            }}
          </Dropzone>
        </Box>
      </Flex>

      {/* Enhanced Crop Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" h="80vh">
          <ModalHeader>Crop and Adjust Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="hidden" h="full">
            <Flex direction={{ base: "column", md: "row" }} gap={6} h="full">
              {/* Main crop area - completely revamped for proper image display */}
              <Box
                flex="3"
                bg="gray.100"
                _dark={{ bg: "gray.700" }}
                borderRadius="md"
                position="relative"
                overflow="hidden"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {selectedImageUrl && (
                  <Box
                    position="relative"
                    w="auto"
                    h="auto"
                    maxH="100%"
                    maxW="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspect}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={
                          selectedImageUrl?.startsWith("/files")
                            ? `${baseUrl}${selectedImageUrl}`
                            : selectedImageUrl
                        }
                        crossOrigin="anonymous" // Add crossOrigin attribute to prevent canvas tainting
                        style={{
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          transformOrigin: "center center",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "70vh",
                        }}
                        draggable="false"
                        onLoad={() => {
                          // When image loads
                          setTimeout(() => {
                            // Set up initial crop on image load with a slight delay
                            // to ensure dimensions are correctly calculated
                            if (imgRef.current) {
                              const { naturalWidth, naturalHeight } =
                                imgRef.current;
                              const imageAspect = naturalWidth / naturalHeight;

                              // Base the initial crop on the image's natural aspect ratio
                              if (aspect) {
                                setAspectRatio(aspect); // Use the selected aspect ratio

                                // Also set completedCrop for the aspect ratio case
                                if (imgRef.current) {
                                  const { width, height } = imgRef.current;
                                  const cropObj = crop || {
                                    unit: "%",
                                    width: 80,
                                    height: 80,
                                    x: 10,
                                    y: 10,
                                  };
                                  const pixelCrop: PixelCrop = {
                                    unit: "px",
                                    width: (cropObj.width * width) / 100,
                                    height: (cropObj.height * height) / 100,
                                    x: (cropObj.x * width) / 100,
                                    y: (cropObj.y * height) / 100,
                                  };
                                  setCompletedCrop(pixelCrop);
                                }
                              } else {
                                // Create a default crop that respects the image's aspect ratio
                                const newCrop: Crop = {
                                  unit: "%", // This is explicitly typed as "%" to satisfy the Crop type
                                  width: 80,
                                  height:
                                    imageAspect > 1 ? 80 / imageAspect : 80,
                                  x: 10,
                                  y: 10,
                                };
                                setCrop(newCrop);

                                // Convert percentage crop to pixel crop for completedCrop
                                if (imgRef.current) {
                                  const { width, height } = imgRef.current;
                                  const pixelCrop: PixelCrop = {
                                    unit: "px",
                                    width: (newCrop.width * width) / 100,
                                    height: (newCrop.height * height) / 100,
                                    x: (newCrop.x * width) / 100,
                                    y: (newCrop.y * height) / 100,
                                  };
                                  setCompletedCrop(pixelCrop);
                                }
                              }
                            }
                          }, 100);
                        }}
                      />
                    </ReactCrop>
                  </Box>
                )}
              </Box>

              {/* Right side tools and previews */}
              <Flex flex="1" direction="column" gap={6} overflow="auto" pr={2}>
                {/* Live previews */}
                {completedCrop && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Live Previews
                    </Text>
                    <Flex direction="column" gap={4}>
                      <Box>
                        <Text fontSize="sm" mb={1}>
                          Avatar Preview:
                        </Text>
                        <Avatar
                          size="md"
                          name={username || "User"}
                          src={previewUrls.avatar || NoImageFile}
                        />
                      </Box>

                      <Box>
                        <Text fontSize="sm" mb={1}>
                          Profile Preview:
                        </Text>
                        <Box
                          w="150px"
                          h="150px"
                          borderRadius="lg"
                          overflow="hidden"
                          border="1px solid"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                        >
                          <img
                            src={previewUrls.profile || NoImageFile}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                            onError={(e) =>
                              console.error("Profile preview image error:", e)
                            }
                          />
                        </Box>
                      </Box>
                    </Flex>
                  </Box>
                )}
                {/* Aspect ratio tools */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Aspect Ratio
                  </Text>
                  <ButtonGroup size="sm" isAttached variant="outline" mb={4}>
                    <Tooltip label="Free crop">
                      <IconButton
                        aria-label="Free crop"
                        icon={<FiMaximize />}
                        colorScheme={aspect === undefined ? "blue" : "gray"}
                        onClick={() => setAspectRatio(undefined)}
                      />
                    </Tooltip>
                    <Tooltip label="Square (1:1)">
                      <IconButton
                        aria-label="Square aspect"
                        icon={<FiSquare />}
                        colorScheme={aspect === 1 ? "blue" : "gray"}
                        onClick={() => setAspectRatio(1)}
                      />
                    </Tooltip>
                    <Tooltip label="Photo (4:3)">
                      <IconButton
                        aria-label="4:3 aspect"
                        icon={<MdAspectRatio />}
                        colorScheme={aspect === 4 / 3 ? "blue" : "gray"}
                        onClick={() => setAspectRatio(4 / 3)}
                      />
                    </Tooltip>
                  </ButtonGroup>
                </Box>

                {/* Rotation and zoom tools */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Adjustments
                  </Text>
                  <Box mb={4}>
                    <Flex align="center" justify="space-between" mb={1}>
                      <Text fontSize="sm">Zoom</Text>
                      <ButtonGroup size="xs" isAttached>
                        <Button onClick={() => setScale(1)}>Reset</Button>
                      </ButtonGroup>
                    </Flex>
                    <Slider
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={scale}
                      onChange={(val) => setScale(val)}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Box>
                    <Flex align="center" justify="space-between" mb={1}>
                      <Text fontSize="sm">Rotate</Text>
                      <ButtonGroup size="xs" isAttached>
                        <IconButton
                          aria-label="Rotate left"
                          icon={<AiOutlineRotateLeft />}
                          onClick={() => setRotate((r) => r - 90)}
                          size="xs"
                        />
                        <IconButton
                          aria-label="Rotate right"
                          icon={<AiOutlineRotateRight />}
                          onClick={() => setRotate((r) => r + 90)}
                          size="xs"
                        />
                        <Button onClick={() => setRotate(0)} size="xs">
                          Reset
                        </Button>
                      </ButtonGroup>
                    </Flex>
                    <Slider
                      min={0}
                      max={360}
                      step={1}
                      value={rotate}
                      onChange={(val) => setRotate(val)}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button onClick={resetCrop} colorScheme="gray" mr={2}>
              Reset
            </Button>
            <Button onClick={onClose} colorScheme="gray" mr={2}>
              Cancel
            </Button>
            <Button onClick={applyCrop} colorScheme="blue">
              Apply Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
