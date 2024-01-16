// Route for how-to for website

import { Flex } from "@chakra-ui/react";
import { HowToSidebar } from "../components/Pages/HowTo/HowToSidebar";
import { HowToView } from "../components/Pages/HowTo/HowToView";
import { Head } from "../components/Base/Head";

export const HowTo = () => {
  return (
    <>
      <Head title="How To" />

      <Flex my={"16px"} h={"100%"}>
        <HowToView />
        <HowToSidebar />
      </Flex>
    </>
  );
};
