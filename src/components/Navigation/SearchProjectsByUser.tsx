import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { UserSearchDropdown } from "./UserSearchDropdown";

const SearchProjectsByUser = ({
  handleFilterUserChange,
}: {
  handleFilterUserChange: (user: number | null) => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  useEffect(() => {
    console.log("Selected User: ", selectedUser);
    handleFilterUserChange(selectedUser);
  }, [selectedUser]);

  return (
    <Flex className="w-full justify-end">
      <UserSearchDropdown
        isRequired={false}
        label=""
        helperText=""
        setUserFunction={setSelectedUser}
        placeholder="Search by user"
        className="my-0 h-8 py-0"
        hideCannotFind
      />
    </Flex>
  );
};

export default SearchProjectsByUser;
