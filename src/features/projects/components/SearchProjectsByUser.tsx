import { Flex, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import clsx from "clsx";

const SearchProjectsByUser = ({
  handleFilterUserChange,
}: {
  handleFilterUserChange: (user: number | null) => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  useEffect(() => {
    // console.log("Selected User: ", selectedUser);
    handleFilterUserChange(selectedUser);
  }, [selectedUser]);

  const { colorMode } = useColorMode();

  return (
    <Flex className="relative w-full justify-end">
      <UserSearchDropdown
        isRequired={false}
        label=""
        helperText=""
        setUserFunction={setSelectedUser}
        placeholder="Filter by user"
        className={clsx("z-50 h-8 text-sm")}
        hideCannotFind
      />
    </Flex>
  );
};

export default SearchProjectsByUser;
