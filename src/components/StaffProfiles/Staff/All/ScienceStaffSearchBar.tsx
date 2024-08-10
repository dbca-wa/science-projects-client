import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

const usersInDb = [
  {
    first_name: "Jarid",
    last_name: "Prince",
    email: "jarid.prince@dbca.wa.gov.au",
  },
  {
    first_name: "Ben",
    last_name: "Richardson",
    email: "ben.richardson@dbca.wa.gov.au",
  },
  {
    first_name: "Rory",
    last_name: "McAuley",
    email: "rory.mcauley@dbca.wa.gov.au",
  },
];

const ScienceStaffSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredUsers = usersInDb.filter((user) => {
      const combinedName = `${user.first_name} ${user.last_name}`.toLowerCase();

      return (
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        combinedName.includes(searchTerm.toLowerCase())
      );
    });
    console.log(filteredUsers);
  };

  return (
    <form
      className="flex w-full max-w-sm items-center space-x-2"
      onSubmit={handleSearch}
    >
      <Input
        type="text"
        placeholder="Enter a name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit" className="bg-[#2d2f32]">
        <Search />
      </Button>
    </form>
  );
};

export default ScienceStaffSearchBar;
