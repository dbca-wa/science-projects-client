import imageCompression from "browser-image-compression";

interface Props {
  acceptedImageTypes: string[];
  maxSizeMB: number;
  maxWidthOrHeight: number;
  acceptedFile: File;
  setIsErrorFn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUploadingFn: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFileFn: React.Dispatch<React.SetStateAction<File>>;
  setSelectedImageUrlFn: React.Dispatch<React.SetStateAction<string>>;
  setUploadProgressFn: React.Dispatch<React.SetStateAction<number>>;
  progressInterval: any;
  setProgressIntervalFn: (value: any) => void;
  startSimulatedProgressFn: () => NodeJS.Timeout;
}

export const blobToFile = (blob: Blob, fileName: string): File => {
  const file = new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
  return file;
};

export const handleImageFileCompression = async ({
  acceptedFile,
  acceptedImageTypes,
  maxSizeMB,
  maxWidthOrHeight,
  setIsErrorFn,
  setIsUploadingFn,
  setSelectedFileFn,
  setSelectedImageUrlFn,
  setUploadProgressFn,
  setProgressIntervalFn,
  startSimulatedProgressFn,
  progressInterval,
}: Props) => {
  setIsErrorFn(false);
  setIsUploadingFn(true);
  const newProgressInterval = startSimulatedProgressFn();
  setProgressIntervalFn(newProgressInterval);
  let fileToUpload = acceptedFile[0];

  if (fileToUpload.type) {
    // Error out and return if not the right type
    if (!acceptedImageTypes.includes(fileToUpload.type)) {
      clearInterval(progressInterval);
      setIsErrorFn(true);
      return;
    }
    //
    console.log("File is of correct type");
    if (fileToUpload.size > maxSizeMB * 1024 * 1024) {
      console.log(
        `File is ${(fileToUpload.size / 1000000).toFixed(2)}MB - which is too large, trying to compress`,
      );
      try {
        const options = {
          maxSizeMB: maxSizeMB,
          useWebWorker: true,
          maxWidthOrHeight: maxWidthOrHeight,
        };
        //   fileToUpload = await imageCompression(fileToUpload, options);
        const compressedBlob = await imageCompression(fileToUpload, options);
        fileToUpload = blobToFile(compressedBlob, fileToUpload.name) as File;
        console.log(
          `compressed to ${(fileToUpload.size / 1000000).toFixed(2)}MB~`,
        );
      } catch (error) {
        console.error("Error during image compression:", error);
        setIsErrorFn(true);
        setIsUploadingFn(false);
        clearInterval(progressInterval);
        return;
      }
    }
    console.log(fileToUpload);

    setSelectedFileFn(fileToUpload);
    // setSelectedImageUrlFn &&
    setSelectedImageUrlFn(URL.createObjectURL(fileToUpload));
    clearInterval(progressInterval);
    setUploadProgressFn(100);
    return fileToUpload;
  }
};
