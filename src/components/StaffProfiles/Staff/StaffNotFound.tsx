import { Button as ChakraButton, Icon } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";

const StaffNotFound = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 py-16">
      <p className="text-balance text-center">
        Sorry, that staff member may have left the department.
      </p>
      <ChakraButton
        className="mt-8"
        onClick={() => {
          window.location.href = "/staff";
        }}
        bg={"blue.500"}
        _hover={{
          bg: "blue.600",
        }}
      >
        <Icon as={MdArrowBack} className="mr-2" />
        Back to Listings
      </ChakraButton>
    </div>
  );
};

export default StaffNotFound;
