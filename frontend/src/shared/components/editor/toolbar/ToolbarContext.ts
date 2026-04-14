import { createContext } from "react";

/** Context for toolbar dark mode — set by Toolbar, consumed by all buttons */
export const ToolbarDarkModeContext = createContext(false);
