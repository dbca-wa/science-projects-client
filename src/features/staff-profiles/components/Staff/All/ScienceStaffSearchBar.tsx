import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
        className="border-blue-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-400"
        type="text"
        placeholder="Enter a name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit" className="bg-[#2d2f32]" aria-label="Search">
        <Search />
      </Button>
    </form>
  );
};

export default ScienceStaffSearchBar;
