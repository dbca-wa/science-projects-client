import {
  deleteReportMediaImage,
  uploadReportMediaImage,
} from "@/features/admin/services/admin.service";
import { handleImageFileCompression } from "@/shared/utils/imageCompression";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Progress } from "@/shared/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";

interface Props {
  section:
    | "cover"
    | "rear_cover"
    | "sdchart"
    | "service_delivery"
    | "research"
    | "partnerships"
    | "collaborations"
    | "student_projects"
    | "publications"
    | "dbca_banner"
    | "dbca_banner_cropped";
  helperText?: string;
  reportMediaData: any;
  reportPk: number;
  refetchData: () => void;
}

export const ReportMediaChanger = ({
  reportMediaData,
  section,
  reportPk,
  refetchData,
}: Props) => {
  const { colorMode } = useColorMode();
  const titleDictionary = {
    cover: "Cover Page",
    sdchart: "Service Delivery Org Chart",
    service_delivery: "Service Delivery Chapter Image",
    research: "Research Chapter Image",
    partnerships: "Partnerships Chapter Image",
    collaborations: "Collaborations Chapter Image",
    student_projects: "Student Projects Chapter Image",
    publications: "Publications Chapter Image",
    rear_cover: "Rear Cover Page",
    dbca_banner: "DBCA Banner (bottom of front page)",
    dbca_banner_cropped: "Header of main pages next to year",
  };

  const [uploadedFile, setUploadedFile] = useState<File>();
  const [isError, setIsError] = useState(false);
  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File>(null);

  const queryClient = useQueryClient();

  const onFileDrop = async (acceptedFile) => {
    if (acceptedFile[0].type) {
      if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
        setIsError(true);
        return;
      } else {
        try {
          handleImageFileCompression({
            acceptedFile: acceptedFile,
            acceptedImageTypes: acceptedImageTypes,
            maxSizeMB: 3,
            maxWidthOrHeight: 1920,
            setIsErrorFn: setIsError,
            setIsUploadingFn: setIsUploading,
            setSelectedFileFn: setSelectedFile,
            setSelectedImageUrlFn: setCurrentImage,
            setUploadProgressFn: setUploadProgress,
            setProgressIntervalFn: setProgressInterval,
            startSimulatedProgressFn: startSimulatedProgress,
            progressInterval: progressInterval,
          }).then((fileData) => {
            const mutationData = {
              file: fileData,
              section: section,
              pk: reportPk,
            };
            fileDropMutation.mutate(mutationData);
          });
        } catch (error) {
          console.error("Error during image compression:", error);
          return;
        }
      }
    }
  };

  const onDeleteEntry = (e) => {
    e.preventDefault();
    const data = {
      pk: reportPk,
      section: section,
    };
    deleteImageMutation.mutate(data);
  };

  const fileDropMutation = useMutation({
    mutationFn: uploadReportMediaImage,
    onMutate: (mutationData) => {
      setIsError(false);
      setIsUploading(true);
      const newProgressInterval = startSimulatedProgress();
      setProgressInterval(newProgressInterval);

      toast.loading("Uploading");

      return mutationData;
    },
    onSuccess: async (data, mutationData) => {
      toast.success("Image Uploaded");
      setUploadedFile(mutationData.file);
      setCurrentImage(URL.createObjectURL(mutationData.file));

      setTimeout(async () => {
        clearInterval(progressInterval);
        setUploadProgress(100);

        queryClient.invalidateQueries({
          queryKey: ["reportMedia", mutationData.pk],
        });

        await refetchData();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could not upload image: ${error}`);
      clearInterval(progressInterval);
      setUploadProgress(0);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteReportMediaImage,
    onMutate: () => {
      toast.loading("Deleting File");
    },
    onSuccess: async () => {
      toast.success("Image Deleted");
      setUploadedFile(null);
      setCurrentImage(null);
      setUploadProgress(0);

      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["reportMedia", reportPk] });
        await refetchData();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could not delete image: ${error}`);
    },
  });

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

  const [currentImage, setCurrentImage] = useState<string | null>(() => {
    const matches = reportMediaData.filter((i) => i.kind === section);
    if (matches.length < 1) {
      return null;
    } else {
      return matches[0].file;
    }
  });

  const baseUrl = useApiEndpoint();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-[400px] relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isHovered ? "pointer" : undefined }}
    >
      {(isHovered && currentImage) || (isHovered && uploadedFile) ? (
        <div
          className="absolute right-4 bottom-4 z-[99999] text-red-500 hover:text-red-400 cursor-pointer"
          onClick={(e) => {
            onDeleteEntry(e);
          }}
        >
          <ImCross size={"25px"} />
        </div>
      ) : null}

      <Dropzone multiple={false} onDrop={onFileDrop}>
        {({ getRootProps, getInputProps, acceptedFiles }) => (
          <div
            {...getRootProps()}
            className={`h-[400px] w-full border border-dashed rounded-lg ${
              colorMode === "light" 
                ? "bg-gray-100 border-gray-300" 
                : "bg-gray-700 border-gray-500"
            }`}
          >
            {(acceptedFiles &&
              !isError &&
              currentImage !== null &&
              acceptedFiles[0] instanceof File) ||
            currentImage !== null ? (
              <div className="w-full h-full relative rounded-lg">
                <div className="absolute bottom-0 w-full py-4 px-4 bg-black/80 rounded-b-lg text-center z-[99]">
                  <p className="text-white">{titleDictionary[section]}</p>
                </div>

                <div className="overflow-hidden w-full h-full rounded-lg">
                  <img
                    className="rounded-lg object-cover w-full h-full"
                    src={
                      acceptedFiles &&
                      !isError &&
                      currentImage !== null &&
                      selectedFile instanceof File
                        ? URL.createObjectURL(selectedFile)
                        : currentImage && currentImage !== null
                          ? `${baseUrl}${currentImage}`
                          : undefined
                    }
                    alt={titleDictionary[section]}
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
                    {`Drag and drop an image for the`}
                  </p>
                  <p className="font-semibold">{`${titleDictionary[section]}`}</p>
                </div>

                {isUploading ? (
                  <div className="w-full mt-4 max-w-xs mx-auto flex justify-center">
                    <div className="w-4/5 h-1 px-1">
                      <Progress
                        value={uploadProgress}
                        className={`${
                          colorMode === "light" ? "bg-gray-200" : "bg-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                ) : null}

                {isError ? (
                  <p className="text-red-500 mt-4">
                    That file is not of the correct type
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};
