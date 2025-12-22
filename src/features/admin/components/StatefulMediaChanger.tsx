import { handleImageFileCompression } from "@/shared/utils/imageCompression";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { Progress } from "@/shared/components/ui/progress";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";

interface Props {
  helperText?: string;
  selectedImageUrl: string | null;
  setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
  clearImageAddedFunctionality?: () => void;
}

export const StatefulMediaChanger = ({
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
  clearImageAddedFunctionality,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();

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

  useEffect(() => {
    if (isError) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  }, [isError, progressInterval]);

  const baseUrl = useApiEndpoint();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isHovered ? "pointer" : undefined }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={acceptedImageTypes.join(",")}
        onChange={handleFileInputChange}
      />

      {isHovered &&
      selectedImageUrl &&
      selectedImageUrl !== null &&
      !selectedImageUrl.endsWith("undefined") ? (
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
          <ImCross size={"25px"} />
        </div>
      ) : null}

      <Dropzone multiple={false} onDrop={onFileDrop}>
        {({ getRootProps, getInputProps, acceptedFiles }) => {
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
              {selectedImageUrl &&
              selectedImageUrl !== undefined &&
              selectedImageUrl !== null &&
              !selectedImageUrl.endsWith("undefined") ? (
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
                      alt="Selected"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg flex flex-col justify-center items-center w-full h-full bg-black/80 z-[3]">
                  <div className="flex flex-col justify-center items-center">
                    <BsCloudArrowUp size={"50px"} color={"white"} />
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
  );
};
