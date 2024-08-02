import { useMediaQuery } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IStaffHeroProps {
  isLoading: boolean;
  fullName: string; // no titles
  positionTitle: string;
  branchName: string;
  tags: string[]; // make this max of 5
}

const StaffHero = ({
  isLoading,
  fullName,
  positionTitle,
  branchName,
  tags,
}: IStaffHeroProps) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px");
  return isDesktop ? (
    <div className="flex flex-col">
      {/* Back button */}
      <div
        className="flex cursor-pointer justify-center py-5 hover:underline"
        onClick={() => navigate("/staff")}
      >
        <ChevronLeft />
        <p className="font-semibold">Back to Search</p>
      </div>

      {/* Name, Title and Tag */}
      <div className="flex w-full flex-col justify-center p-4 text-center">
        <p className="text-2xl font-bold">{fullName}</p>
        <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
          {positionTitle}
          {branchName && `, ${branchName}`}
        </p>
        <p className="mt-4 text-balance text-muted-foreground">
          {tags?.map((word: string) => word).join(" | ")}
        </p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      {/* Back button */}
      <div
        className="flex cursor-pointer justify-center py-5 hover:underline"
        onClick={() => navigate("/staff")}
      >
        <ChevronLeft />
        <p className="font-semibold dark:text-slate-300">Back to Search</p>
      </div>

      {/* Name, Title and Tag */}
      <div className="flex w-full flex-col justify-center p-4 text-center dark:text-slate-300">
        <p className="text-2xl font-bold">{fullName}</p>
        <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
          {positionTitle}
          {branchName && `, ${branchName}`}
        </p>
        <p className="mt-4 text-balance text-muted-foreground">
          {tags?.map((word: string) => word).join(" | ")}
        </p>
      </div>
    </div>
  );
};
export default StaffHero;
