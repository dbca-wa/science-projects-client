// Hook used to determine the noimage file for projects

import { useColorMode } from "@chakra-ui/react";

export const useNoImage = () => {
  const { colorMode } = useColorMode();
  const image =
    colorMode === "dark" ? "/no-image-dark.png" : "/no-image-light2.jpg";
  return image;
};
