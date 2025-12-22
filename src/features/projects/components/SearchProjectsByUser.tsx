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

  return (
    <div className="relative w-full flex justify-end">
      <UserSearchDropdown
        isRequired={false}
        label=""
        helperText=""
        setUserFunction={setSelectedUser}
        placeholder="Filter by user"
        className={clsx("z-50 h-8 text-sm")}
        hideCannotFind
      />
    </div>
  );
};

export default SearchProjectsByUser;
