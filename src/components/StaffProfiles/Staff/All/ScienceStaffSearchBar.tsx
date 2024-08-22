import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";

const ScienceStaffSearchBar = ({
  searchTerm: initialSearchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchTerm);
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
