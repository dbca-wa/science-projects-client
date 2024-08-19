import { useStaffProfileHero } from "@/lib/hooks/tanstack/useStaffProfileHero";
import { IUserMe } from "@/types";
import {
  Center,
  Button as ChakraButton,
  Spinner,
  useMediaQuery,
} from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  SendUserEmailDialog,
  SendUserEmailMobileDrawer,
} from "../All/ScienceStaffSearchResult";
import AddItemButton from "./AddItemButton";

interface IStaffHeroProp {
  viewingUser: IUserMe;
  usersPk: string;
  buttonsVisible: boolean;
}

const StaffHero = ({
  usersPk,
  buttonsVisible,
  viewingUser,
}: IStaffHeroProp) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px");

  const { staffHeroData, staffHeroLoading } = useStaffProfileHero(usersPk);

  // branchName={"Kensington"}
  // positionTitle={"Web and Data Development Officer"}
  // fullName={"Jarid Prince"}
  // tags={["React", "Django", "Docker", "Kubernetes", "ETL"]}

  return !staffHeroLoading ? (
    isDesktop ? (
      <div className="flex flex-col">
        {/* Back button */}

        <div className="flex justify-center py-5">
          <ChakraButton
            onClick={() => navigate("/staff")}
            variant={"link"}
            leftIcon={<ChevronLeft />}
            color={"black"}
          >
            Back to Search
          </ChakraButton>
        </div>

        {/* Name, Title and Tag */}
        <div className="flex w-full flex-col justify-center p-4 pb-2 text-center">
          <p className="text-2xl font-bold">
            {staffHeroData?.title && `${staffHeroData?.title}. `}
            {staffHeroData?.name}
          </p>

          <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
            {staffHeroData?.positionTitle
              ? staffHeroData?.positionTitle
              : "Staff Member"}
            {staffHeroData?.branch
              ? `, ${staffHeroData?.branch}`
              : ", No branch set"}
          </p>
          <div className="mt-4 flex items-center justify-center">
            <p className="text-balance text-muted-foreground">
              {staffHeroData?.tags?.map((word: string) => word).join(" | ")}
            </p>
            {staffHeroData?.tags?.length === 0 ||
              (!staffHeroData?.tags && (
                <p className="text-balance text-muted-foreground">
                  No keywords
                </p>
              ))}
            {String(viewingUser?.pk) === usersPk && buttonsVisible ? (
              <AddItemButton
                ml={4}
                icon={MdEdit}
                ariaLabel={"Edit Tags Button"}
                label={"Edit Tags"}
                onClick={() => {}}
                innerItemSize={"20px"}
                p={1}
              />
            ) : null}
          </div>
          {!buttonsVisible && (
            <div className="mt-4 flex justify-center">
              {!isDesktop ? (
                <SendUserEmailMobileDrawer
                  name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                  email={staffHeroData?.user?.email}
                />
              ) : (
                <SendUserEmailDialog
                  name={`${staffHeroData?.user?.display_first_name} ${staffHeroData?.user?.display_last_name}`}
                  email={staffHeroData?.user?.email}
                />
              )}
            </div>
          )}
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
          <p className="text-2xl font-bold">
            {staffHeroData?.title && `${staffHeroData?.title}. `}
            {staffHeroData?.name}
          </p>
          <p className="mt-4 text-balance font-semibold text-slate-700 dark:text-slate-400">
            {staffHeroData?.positionTitle}
            {staffHeroData?.branch && `, ${staffHeroData?.branch}`}
          </p>
          <p className="mt-4 text-balance text-muted-foreground">
            {staffHeroData?.tags?.map((word: string) => word).join(" | ")}
          </p>
        </div>
      </div>
    )
  ) : (
    <Center p={4}>
      <Spinner />
    </Center>
  );
};
export default StaffHero;
