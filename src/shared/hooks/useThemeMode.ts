import { useTheme } from "next-themes";

/**
 * Custom hook that provides a Chakra-like interface for theme management
 * using next-themes under the hood
 */
export const useThemeMode = () => {
  const { theme, setTheme } = useTheme();
  
  return {
    colorMode: theme as "light" | "dark",
    toggleColorMode: () => {
      setTheme(theme === "light" ? "dark" : "light");
    },
    setColorMode: (mode: "light" | "dark") => {
      setTheme(mode);
    },
  };
};