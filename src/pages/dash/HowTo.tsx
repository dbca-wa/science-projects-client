// Route for how-to for website

import { Head } from "@/shared/components/layout/base/Head";
import { HowToSidebar } from "@/features/dashboard/components/howto/HowToSidebar";
import { HowToView } from "@/features/dashboard/components/howto/HowToView";
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
