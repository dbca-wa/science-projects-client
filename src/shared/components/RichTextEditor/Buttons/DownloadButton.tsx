// WIP Button to download the html, markdown or json of the content in the editor.

import { FaDownload } from "react-icons/fa";
import { BaseOptionsButton } from "./BaseOptionsButton";

interface Props {
  canDownload: boolean;
}

export const DownloadButton = ({ canDownload }: Props) => {
  return (
    <BaseOptionsButton
      canRunFunction={canDownload}
      toolTipText="Download"
      icon={FaDownload}
      // colorScheme=""
      onClick={() => {
        console.log("downloading");
      }}
    />
  );
};
