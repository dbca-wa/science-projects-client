import { useColorMode } from "@/shared/utils/theme.utils";

export const useBoxShadow = () => {
  const { colorMode } = useColorMode();
  let shadowing = "";
  if (colorMode === "light") {
    shadowing =
      "0px 6.67px 10px -3.33px rgba(0, 0, 0, 0.1), 0px 1.33px 1.67px -0.67px rgba(0, 0, 0, 0.02), -1px 0px 3.33px -0.67px rgba(0, 0, 0, 0.0333), 1px 0px 3.33px -0.67px rgba(0, 0, 0, 0.0333), 0px -1.33px 2.67px -0.67px rgba(0, 0, 0, 0.044)";
  } else {
    shadowing =
      "0px 0.67px 1px -0.17px rgba(255, 255, 255, 0.0125), 0px 0.33px 0.67px -0.17px rgba(255, 255, 255, 0.0075), 0px -0.33px 0.67px -0.33px rgba(255, 255, 255, 0.017)";
  }

  return shadowing;
};
