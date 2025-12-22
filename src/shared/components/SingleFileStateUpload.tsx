import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { FaFile, FaFilePdf } from "react-icons/fa";
import { TbPhoto } from "react-icons/tb";
import imageCompression from "browser-image-compression";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Progress } from "@/shared/components/ui/progress";

export interface IFileType {
  fileType: "pdf" | "image";
}

export const FileDropzone = ({
  fileType,
  setUploadedFile,
  uploadedFile,
  isError,
  setIsError,
  extraText,
}: {
  fileType: "pdf" | "image";
  setUploadedFile: React.Dispatch<React.SetStateAction<File>>;
  uploadedFile: File;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  extraText: string;
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const { colorMode } = useColorMode();

  const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const onFileDrop = async (acceptedFile) => {
    // if(acceptedFile.type)
    if (
      (fileType === "pdf" && acceptedFile[0].type !== "application/pdf") ||
      (fileType === "image" &&
        !acceptedImageTypes.includes(acceptedFile[0].type))
    ) {
      setIsError(true);
      return;
    }
    setIsError(false);
    setIsUploading(true);
    const newProgressInterval = startSimulatedProgress();
    setProgressInterval(newProgressInterval);

    // Implement compression
    let fileToUpload = acceptedFile[0];
    const MAX_SIZE_MB = 2;
    if (fileToUpload.size > MAX_SIZE_MB * 1024 * 1024) {
      console.log(`${fileToUpload.size} size too large compressing`);
      try {
        const options = {
          maxSizeMB: MAX_SIZE_MB,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(fileToUpload, options);
      } catch (error) {
        console.error("Error during image compression:", error);
        setIsError(true);
        setIsUploading(false);
        clearInterval(progressInterval);
        return;
      }
    }
    setTimeout(() => {
      clearInterval(newProgressInterval);
      setUploadProgress(100);
      setUploadedFile(fileToUpload);
      setIsUploading(false);
    }, 1500);
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

  useEffect(() => {
    if (!uploadedFile) {
      setUploadProgress(0);
    }
  }, [uploadedFile]);

  return (
    <Dropzone multiple={false} onDrop={onFileDrop}>
      {({
        getRootProps,
        // getInputProps,
        acceptedFiles,
      }) => (
        <div
          {...getRootProps()}
          className={`h-64 m-4 border border-dashed rounded-lg ${
            colorMode === "light" ? "border-gray-300" : "border-gray-500"
          }`}
        >
          <div className="flex justify-center items-center h-full w-full rounded-lg">
            <div
              className={`rounded-lg flex flex-col justify-center items-center pt-5 pb-6 w-full h-full select-none cursor-pointer ${
                colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
              }`}
            >
              <div>
                <BsCloudArrowUp size={"50px"} color="gray" />
              </div>
              {extraText === undefined ? (
                <p className="px-8 text-center">{`Drag and drop a ${fileType} file.`}</p>
              ) : (
                <p className="px-8 text-center">{`Drag and drop ${
                  fileType === "image" ? "an" : "a"
                } ${fileType} file${extraText}.`}</p>
              )}
              {!isError && acceptedFiles && acceptedFiles[0] && uploadedFile ? (
                <div
                  className={`flex mt-4 max-w-[80%] justify-center rounded-md overflow-hidden outline outline-1 outline-gray-800 border ${
                    colorMode === "light" 
                      ? "bg-white border-gray-300" 
                      : "bg-gray-800 border-gray-600"
                  }`}
                >
                  <div
                    className={`p-3 h-full place-items-center items-center border-r ${
                      colorMode === "light" ? "border-gray-300" : "border-gray-600"
                    }`}
                  >
                    <div className={fileType === "pdf" ? "text-red-500" : "text-blue-500"}>
                      {fileType === "pdf" ? (
                        <FaFilePdf />
                      ) : fileType === "image" ? (
                        <TbPhoto />
                      ) : (
                        <FaFile />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 whitespace-nowrap text-ellipsis overflow-hidden pl-2 pr-3 py-2 text-sm mt-[1px]">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="flex justify-center w-full mt-4 max-w-xs mx-auto">
                  <div className="w-[80%] h-1 px-1">
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
                <p className="text-red-500 mt-4">
                  That file is not of the correct type
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

interface Props {
  fileType: "pdf" | "image";
  uploadedFile: File;
  setUploadedFile: React.Dispatch<React.SetStateAction<File>>;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  extraText?: string;
}

export const SingleFileStateUpload = ({
  fileType,
  uploadedFile,
  setUploadedFile,
  isError,
  setIsError,
  extraText,
}: Props) => {
  return (
    <div>
      <FileDropzone
        fileType={fileType}
        setUploadedFile={setUploadedFile}
        uploadedFile={uploadedFile}
        setIsError={setIsError}
        isError={isError}
        extraText={extraText}
      />
    </div>
  );
};
