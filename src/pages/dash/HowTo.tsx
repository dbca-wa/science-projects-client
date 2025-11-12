// Route for how-to for website

import { Head } from "@/shared/components/Base/Head";
import { HowToSidebar } from "@/shared/components/Pages/HowTo/HowToSidebar";
import { HowToView } from "@/shared/components/Pages/HowTo/HowToView";
import { Flex } from "@chakra-ui/react";

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
