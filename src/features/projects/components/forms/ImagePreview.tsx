// Used on project creation page to display a preview of the uploaded image

export const ImagePreview: FC<{ selectedFile: File | null }> = ({
  selectedFile,
}) => {
  const aspectRatio = 9 / 16; // 16:9 aspect ratio
  const width = 600;
  const height = width * aspectRatio;

  const imageUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";

  return (
    <>
      {selectedFile && (
        <div
          className="relative cursor-pointer overflow-hidden rounded-2xl"
          style={{ 
            height: `${height}px`,
            width: `${width}px`,
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
