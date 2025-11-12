// A button for uploading lexical JSON objects to the editor.
// If there is already text, this will be appended below.

import { FaUpload } from "react-icons/fa";
import { BaseOptionsButton } from "./BaseOptionsButton";

export const UploadButton = ({ canUpload }) => {
  return (
    <BaseOptionsButton
      canRunFunction={canUpload}
      toolTipText="Upload"
      icon={FaUpload}
      onClick={() => {
        console.log("uploading");
      }}
    />
  );
};
