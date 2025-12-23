import { handleImageFileCompression } from "@/shared/utils/imageCompression";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Slider } from "@/shared/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Progress } from "@/shared/components/ui/progress";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import { BsCloudArrowUp } from "react-icons/bs";
import { FiEdit, FiMaximize, FiSquare } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { MdAspectRatio } from "react-icons/md";
import ReactCrop, {
  type Crop,
  type PixelCrop,
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
  projectTitle?: string;
  baseAPI?: string;
}

export const StatefulMediaChangerProject = ({
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
  clearImageAddedFunctionality,
  projectTitle,
  baseAPI,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // For cropping modal
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
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
  const [aspect, setAspect] = useState<number | undefined>(16 / 9); // Default to landscape for projects

  // Store the original image URL to be able to revert
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Real-time preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    card: string | null;
  }>({ card: null });

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

      // Calculate the dimensions of the crop area in natural image coordinates
      const cropWidthNatural = crop.width * scaleX;
      const cropHeightNatural = crop.height * scaleY;

      // Apply the user-specified scale to determine final dimensions
      const scaledWidth = cropWidthNatural;
      const scaledHeight = cropHeightNatural;

      // Calculate extra space needed for rotation
      let canvasWidth = scaledWidth;
      let canvasHeight = scaledHeight;

      // If we have rotation, calculate a bounding box for the rotated image
      if (rotate !== 0 && rotate % 360 !== 0) {
        const rotateRads = (rotate * Math.PI) / 180;
        const rotatedWidth =
          Math.abs(Math.cos(rotateRads) * scaledWidth) +
          Math.abs(Math.sin(rotateRads) * scaledHeight);
        const rotatedHeight =
          Math.abs(Math.sin(rotateRads) * scaledWidth) +
          Math.abs(Math.cos(rotateRads) * scaledHeight);

        canvasWidth = rotatedWidth;
        canvasHeight = rotatedHeight;
      }

      // Set device pixel ratio for high-DPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * pixelRatio;
      canvas.height = canvasHeight * pixelRatio;

      // Apply high-quality settings
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";
      ctx.imageSmoothingEnabled = true;

      // Original crop coordinates in natural image coordinates
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      // Set up the canvas for drawing
      ctx.save();

      // Move to center of canvas for rotation
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((rotate * Math.PI) / 180);

      // Scale should be applied here if user applied zoom
      ctx.scale(scale, scale);

      // Move back to properly position the crop
      ctx.translate(-scaledWidth / 2, -scaledHeight / 2);

      // Draw the cropped image
      ctx.drawImage(
        image,
        cropX, // sx - source x
        cropY, // sy - source y
        cropWidthNatural, // sWidth - source width
        cropHeightNatural, // sHeight - source height
        0, // dx - destination x
        0, // dy - destination y
        scaledWidth, // dWidth - destination width
        scaledHeight, // dHeight - destination height
      );

      ctx.restore();

      // Create and return the URL for the cropped image
      return new Promise<string>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Canvas to Blob conversion failed");
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve(url);
          },
          "image/jpeg",
          0.95, // high quality
        );
      });
    },
    [],
  );

  // Update previews when crop changes
  useEffect(() => {
    async function updatePreviews() {
      if (completedCrop && imgRef.current) {
        try {
          const previewUrl = await generateCropPreview(
            imgRef.current,
            completedCrop,
            scale,
            rotate,
          );

          if (previewUrl) {
            // Use the preview URL for the card
            setPreviewUrls({
              card: previewUrl,
            });
          }
        } catch (error) {
          console.error("Error generating preview:", error);
        }
      }
    }

    updatePreviews();
  }, [completedCrop, scale, rotate, generateCropPreview]);

  // Apply the crop to the image
  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
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
          selectedFile ? selectedFile.name : "cropped-project-image.jpg",
        );

        // Update the selected file with the cropped one
        setSelectedFile(croppedFile);

        // Update the image URL to show the cropped version
        setSelectedImageUrl(croppedImageUrl);

        // Clear the previews
        setPreviewUrls({ card: null });

        onClose();
      }
    } catch (error) {
      console.error("Error applying crop:", error);
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
    setPreviewUrls({ card: null });
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
    setPreviewUrls({ card: null });
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
      width: 70,
      height: 70,
      x: 15,
      y: 15,
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

  // Force a new completedCrop when the image loads
  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      // Create a default initial crop
      setTimeout(() => {
        if (imgRef.current) {
          const { width, height } = imgRef.current;

          // Default to landscape if no aspect ratio is specified
          const defaultAspect = aspect || 16 / 9;

          // Use makeAspectCrop to create a crop with the correct aspect ratio
          const initialCrop = makeAspectCrop(
            {
              unit: "%",
              width: 80, // Use a large portion of the image
            },
            defaultAspect,
            width,
            height,
          );

          // Center the crop
          const centeredCrop = centerCrop(initialCrop, width, height);
          setCrop(centeredCrop);

          // Convert to pixel crop for the completed crop
          const pixelCrop: PixelCrop = {
            unit: "px",
            width: (centeredCrop.width * width) / 100,
            height: (centeredCrop.height * height) / 100,
            x: (centeredCrop.x * width) / 100,
            y: (centeredCrop.y * height) / 100,
          };

          setCompletedCrop(pixelCrop);
        }
      }, 100); // Small delay to ensure image dimensions are calculated
    }
  }, [aspect]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className="flex flex-row w-full gap-6 select-none">
        {/* Only show preview if we have an image */}
        {hasValidImage && (
          <div className="flex flex-col items-center justify-center min-w-[220px] px-4">
            {/* Project Card Preview */}
            <div className="text-center">
              <p className="text-sm mb-2 font-medium">
                Project Card Preview:
              </p>
              <div
                className={`w-[200px] h-[120px] rounded-lg overflow-hidden border mx-auto shadow-sm ${
                  colorMode === "light" 
                    ? "border-gray-200 bg-white" 
                    : "border-gray-600 bg-gray-700"
                }`}
              >
                <img
                  src={
                    selectedImageUrl
                      ? selectedImageUrl?.startsWith("/files")
                        ? `${baseUrl}${selectedImageUrl}`
                        : selectedImageUrl
                      : NoImageFile
                  }
                  alt={`Project: ${projectTitle || "Project"}`}
                  className="h-full w-full object-cover"
                  onError={() => setIsImageError(true)}
                  draggable="false"
                />
              </div>

              {/* Dynamic photo note */}
              <p
                className={`text-xs mt-2 max-w-[200px] mx-auto text-center italic ${
                  colorMode === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Photos are dynamic when not printed
              </p>
            </div>
          </div>
        )}

        {/* Upload area - will take all remaining space */}
        <div
          className={`relative flex-1 ${isHovered ? "cursor-pointer" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
            <div
              className="bg-white p-4 rounded-full absolute right-4 top-4 text-red-500 hover:text-red-400 z-[99999]"
              onClick={async (e) => {
                onDeleteEntry(e);
                if (clearImageAddedFunctionality) {
                  console.log("Clearing image");
                  await clearImageAddedFunctionality();
                  console.log("cleared");
                }
              }}
            >
              <X size={25} />
            </div>
          ) : null}

          {/* Edit button */}
          {isHovered && hasValidImage ? (
            <div
              className="bg-white p-4 rounded-full absolute left-4 top-4 text-blue-500 hover:text-blue-400 z-[99999]"
              onClick={openCropModal}
            >
              <FiEdit size={"25px"} />
            </div>
          ) : null}

          <Dropzone multiple={false} onDrop={onFileDrop}>
            {({ getRootProps, getInputProps }) => {
              // Extract only the dropzone props without the onClick handler
              const { onClick, ...rootProps } = getRootProps();

              return (
                <div
                  {...rootProps}
                  className={`h-72 w-full border border-dashed rounded-lg ${
                    colorMode === "light" ? "border-gray-300" : "border-gray-500"
                  }`}
                  onClick={(e) => {
                    // Prevent default onClick behavior from Dropzone
                    e.stopPropagation();
                    // Trigger our file input instead
                    triggerFileInput();
                  }}
                >
                  <input {...getInputProps()} />
                  {hasValidImage ? (
                    <div className="w-full h-full relative rounded-lg">
                      <div className="overflow-hidden w-full h-full rounded-lg">
                        <img
                          className="rounded-lg object-cover w-full h-full"
                          src={
                            selectedImageUrl
                              ? selectedImageUrl?.startsWith("/files")
                                ? `${baseUrl}${selectedImageUrl}`
                                : selectedImageUrl
                              : NoImageFile
                          }
                          alt="Selected project image"
                          draggable="false"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg flex flex-col justify-center items-center w-full h-full bg-black/80 z-[3]">
                      <div className="flex flex-col justify-center items-center">
                        <BsCloudArrowUp size={50} color="white" />
                      </div>

                      <div className="flex flex-col items-center text-center text-white">
                        <p className="px-8 text-center">
                          {`${helperText || "Click or drop image here"}`}
                        </p>
                      </div>

                      {isUploading ? (
                        <div className="w-full mt-4 max-w-xs mx-auto flex justify-center">
                          <div className="w-4/5 h-1 px-1">
                            <Progress
                              value={uploadProgress}
                              className={`h-1 ${
                                colorMode === "light" ? "bg-gray-200" : "bg-gray-900"
                              }`}
                            />
                          </div>
                        </div>
                      ) : null}

                      {isError ? (
                        <div className="flex justify-center">
                          <p className="text-red-500 mt-4">
                            That file is not of the correct type
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            }}
          </Dropzone>
        </div>
      </div>

      {/* Enhanced Crop Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={`max-w-[90vw] h-[80vh] ${
            colorMode === "dark" ? "text-gray-400" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>Crop and Adjust Project Image</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden h-full">
            <div className="flex flex-col md:flex-row gap-6 h-full">
              {/* Main crop area */}
              <div className="flex-[3] bg-gray-100 dark:bg-gray-700 rounded-md relative overflow-hidden flex justify-center items-center">
                {selectedImageUrl && (
                  <div className="relative w-auto h-auto max-h-full max-w-full flex justify-center items-center">
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
                        crossOrigin="anonymous"
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
                        onLoad={handleImageLoad}
                      />
                    </ReactCrop>
                  </div>
                )}
              </div>

              {/* Right side tools and previews */}
              <div className="flex-1 flex flex-col gap-6 overflow-auto pr-2">
                {/* Live preview */}
                {completedCrop && (
                  <div>
                    <p className="font-medium mb-2">
                      Live Preview
                    </p>
                    <div>
                      <p className="text-sm mb-1">
                        Project Card:
                      </p>
                      <div
                        className={`w-[150px] h-[90px] rounded-lg overflow-hidden border shadow-sm ${
                          colorMode === "light" 
                            ? "border-gray-200 bg-white" 
                            : "border-gray-600 bg-gray-700"
                        }`}
                      >
                        <img
                          src={previewUrls.card || NoImageFile}
                          alt="Project card preview"
                          className="h-full w-full object-cover"
                          onError={(e) =>
                            console.error("Card preview image error:", e)
                          }
                          draggable="false"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Aspect ratio tools */}
                <div>
                  <p className="font-medium mb-2">
                    Aspect Ratio
                  </p>
                  <TooltipProvider>
                    <div className="flex mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={aspect === undefined ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAspectRatio(undefined)}
                            className="rounded-r-none"
                          >
                            <FiMaximize />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Free crop</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={aspect === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAspectRatio(1)}
                            className="rounded-none"
                          >
                            <FiSquare />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Square (1:1)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={aspect === 16 / 9 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAspectRatio(16 / 9)}
                            className="rounded-none"
                          >
                            <MdAspectRatio />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Landscape (16:9)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={aspect === 4 / 3 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAspectRatio(4 / 3)}
                            className="rounded-l-none"
                          >
                            <MdAspectRatio />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Photo (4:3)</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                {/* Rotation and zoom tools */}
                <div>
                  <p className="font-medium mb-2">
                    Adjustments
                  </p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">Zoom</p>
                      <Button size="sm" onClick={() => setScale(1)}>Reset</Button>
                    </div>
                    <Slider
                      min={[0.5]}
                      max={[3]}
                      step={[0.1]}
                      value={[scale]}
                      onValueChange={(val) => setScale(val[0])}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">Rotate</p>
                      <div className="flex">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRotate((r) => r - 90)}
                          className="rounded-r-none"
                        >
                          <AiOutlineRotateLeft />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRotate((r) => r + 90)}
                          className="rounded-none"
                        >
                          <AiOutlineRotateRight />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRotate(0)}
                          className="rounded-l-none"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Slider
                      min={[0]}
                      max={[360]}
                      step={[1]}
                      value={[rotate]}
                      onValueChange={(val) => setRotate(val[0])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={resetCrop} variant="outline" className="mr-2">
              Reset
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button onClick={applyCrop}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
