// A button for highlighting font with a color in the rich text editor

import { FaHighlighter } from "react-icons/fa";
import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";

// Similar Dropdown button to FontColorPicker, but for background highlight of text

export const FontHighlighterButton = () => {
  return <BaseToolbarMenuButton menuIcon={FaHighlighter} menuItems={[]} />;
};
