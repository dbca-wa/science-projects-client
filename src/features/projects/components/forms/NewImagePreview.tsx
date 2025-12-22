// Used on project creation page to display a preview of the uploaded image

export const NewImagePreview: FC<{
  selectedFile: File | null;
  currentString: string;
}> = ({ selectedFile, currentString }) => {
  // const aspectRatio = 9 / 16; // 16:9 aspect ratio
  // const width = 600;
  // const height = width * aspectRatio;

  // console.log(URL.createObjectURL(selectedFile))
  const imageUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : currentString;

  return (
    <>
      {imageUrl && (
        <div
          className="relative max-h-[350px] max-w-full cursor-pointer select-none overflow-hidden rounded-2xl"
          style={{ 
            transformStyle: "preserve-3d",
            boxShadow: "0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </>
  );
};
