import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import type { IProjectPlan } from "@/shared/types";
import { Progress } from "@/shared/components/ui/progress";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useRef, useState } from "react"; // Added useRef
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { SaveMethodologyImageButton } from "./SaveMethodologyImageButton";
import { handleImageFileCompression } from "@/shared/utils/imageCompression";

interface Props {
  maxUploadSizeInMb: number;
  refetch: () => void;
  document: IProjectPlan;
  helperText?: string;
  selectedImageUrl: string | null;
  setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
}

export const MethodologyImage = ({
  maxUploadSizeInMb,
  refetch,
  document,
  selectedImageUrl,
  setSelectedImageUrl,
  selectedFile,
  setSelectedFile,
  helperText,
}: Props) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef(null); // ref for the file input

  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const NoImageFile = useNoImage();

  // Function to open file browser
  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file selection from input
  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileDrop([files[0]]);
    }
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

  const onFileDrop = async (acceptedFile) => {
    handleImageFileCompression({
      acceptedFile: acceptedFile,
      acceptedImageTypes: acceptedImageTypes,
      maxSizeMB: maxUploadSizeInMb,
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

  const onDeleteEntryFromServer = () => {
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setUploadProgress(0);
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
    <div className="pb-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={acceptedImageTypes.join(",")}
        onChange={handleFileInputChange}
      />

      <div
        className={`flex rounded-t-[20px] ${
          colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
        }`}
      >
        <div className="flex justify-start items-center">
          <h2 className="pl-8 my-0 py-3 font-bold text-xl">
            Methodology Image
          </h2>
        </div>
        <div className="flex justify-end flex-1">
          <div className="pr-8 py-2 grid grid-cols-2 gap-2">
            <SaveMethodologyImageButton
              refetch={refetch}
              buttonType={"delete"}
              document={document}
              file={selectedFile}
              canSave={true}
              projectPlanPk={document?.pk}
              onDeleteEntry={onDeleteEntryFromServer}
            />
            <SaveMethodologyImageButton
              refetch={refetch}
              buttonType={
                document?.methodology_image === null ? "post" : "update"
              }
              document={document}
              file={selectedFile}
              canSave={true}
              projectPlanPk={document?.pk}
            />
          </div>
        </div>
      </div>

      <div
        className={`relative w-full shadow-[rgba(100,100,111,0.1)_0px_7px_29px_0px] ${
          colorMode === "light" ? "bg-white/40" : "bg-black/40"
        }`}
      >
        <div
          className="relative h-[500px] cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && selectedImageUrl && !document?.methodology_image ? (
            <div className="grid grid-cols-1 gap-[10px] right-4 top-4 absolute">
              <div
                className={`bg-white p-2 rounded-full z-[99999] ${
                  isHovered ? "text-red-500 hover:text-red-400" : "text-green-500"
                }`}
                onClick={(e) => {
                  onDeleteEntry(e);
                }}
              >
                <ImCross size={"25px"} />
              </div>
            </div>
          ) : null}

          <Dropzone multiple={false} onDrop={onFileDrop}>
            {({ getRootProps, getInputProps }) => {
              // Extract only the dropzone props without the onClick handler
              const { onClick, ...rootProps } = getRootProps();

              return (
                <div
                  {...rootProps}
                  className={`h-full w-full rounded-b-lg border ${
                    colorMode === "light" ? "border-gray-300" : "border-gray-500"
                  }`}
                  onClick={(e) => {
                    // Prevent default onClick behavior from Dropzone
                    e.stopPropagation();
                    // Trigger our file input instead
                    openFileBrowser();
                  }}
                >
                  <input {...getInputProps()} />
                  {selectedImageUrl && selectedImageUrl !== undefined ? (
                    <div className="w-full h-full relative rounded-b-lg">
                      <div className="overflow-hidden w-full h-full rounded-b-lg">
                        <img
                          className="rounded-b-lg object-cover w-full h-full pointer-events-none select-none"
                          src={
                            selectedImageUrl
                              ? selectedImageUrl?.startsWith("/files")
                                ? `${baseUrl}${selectedImageUrl}`
                                : selectedImageUrl
                              : NoImageFile
                          }
                          draggable="false"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-b-lg flex flex-col justify-center items-center w-full h-full bg-black/80 z-[3]">
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
                              className={`${
                                colorMode === "light" ? "bg-gray-200" : "bg-gray-900"
                              }`}
                              value={uploadProgress}
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
    </div>
  );
};
