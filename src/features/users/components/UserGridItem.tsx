// Display for a single user on the Users page (mapped over for each user on a grid). Also with drawer for more details.

import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import type { IUserData } from "@/shared/types";
import { UserProfile } from "./UserProfile";
import type { FC, ReactNode } from "react";
import { useState, useEffect } from "react";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";

interface BoxContainerProps {
  children: ReactNode;
  className?: string;
}

export const BoxContainer: FC<BoxContainerProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("grid whitespace-normal max-w-full", className)} {...props}>
      {children}
    </div>
  );
};

export const UserGridItem = ({
  pk,
  username,
  email,
  display_first_name,
  display_last_name,
  is_staff,
  is_superuser,
  is_active,
  business_area,
  role,
  branch,
  image,
  affiliation,
  branches,
  businessAreas,
}: IUserData) => {
  const fullName =
    display_first_name !== null && display_last_name !== null
      ? `${display_first_name} ${display_last_name}`
      : `No Name (${username})`;
      
  // Use Tailwind responsive approach with window size detection
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXlOrLarger = windowWidth >= 1280; // xl breakpoint
  const isLargerOrLarger = windowWidth >= 1024; // lg breakpoint  
  const isOver690 = windowWidth >= 690;

  const imageUrl = useServerImageUrl(image?.file);
  const { colorMode } = useColorMode();

  // Replace useDisclosure with React state
  const [isUserOpen, setIsUserOpen] = useState(false);
  const onUserOpen = () => setIsUserOpen(true);
  const onUserClose = () => setIsUserOpen(false);

  const drawerFunction = () => {
    onUserOpen();
  };

  return (
    <>
      <Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
        <SheetTrigger asChild>
          <div
            className={cn(
              "grid items-center p-4 border w-full cursor-pointer select-none transition-all hover:scale-105",
              "grid-cols-1 lg:grid-cols-[8fr_4fr] xl:grid-cols-[4fr_4fr_2.5fr]",
              colorMode === "light"
                ? "hover:shadow-[0px_5px_10px_-2.5px_rgba(0,0,0,0.15),-0.5px_1px_2px_-0.5px_rgba(0,0,0,0.03),-1.5px_0px_2.5px_-0.5px_rgba(0,0,0,0.0375),0.5px_0px_2.5px_-0.5px_rgba(0,0,0,0.0375)]"
                : "hover:shadow-[0px_1.5px_2.25px_-0.75px_rgba(255,255,255,0.02),-0.5px_0.5px_1px_-0.5px_rgba(255,255,255,0.015)]"
            )}
            key={pk}
            onClick={drawerFunction}
          >
            <div className="flex ml-2">
              <div className="min-w-[55px] mr-4">
                <Avatar className="pointer-events-none h-[55px] w-[55px] cursor-pointer">
                  <AvatarImage src={imageUrl} className="object-cover" />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>

              {/* Full Name */}
              <BoxContainer
                className={cn(
                  "w-full overflow-hidden justify-start grid-cols-1",
                  isXlOrLarger ? "ml-4" : "ml-2"
                )}
              >
                <Button
                  variant="link"
                  className="font-bold cursor-pointer justify-start p-0 h-auto"
                  onClick={drawerFunction}
                >
                  {fullName
                    ? fullName?.startsWith("None ")
                      ? username
                      : fullName.length > 30
                        ? `${fullName.substring(0, 30)}...`
                        : fullName
                    : username}
                </Button>
                <p
                  className={cn(
                    "text-sm",
                    is_superuser
                      ? role === "Executive"
                        ? "text-orange-500"
                        : "text-blue-500"
                      : is_staff
                        ? "text-green-500"
                        : "text-gray-500",
                  )}
                >
                  {is_superuser
                    ? role == "Executive"
                      ? "Executive"
                      : "Admin"
                    : is_staff
                      ? `Staff${
                          business_area?.leader === pk
                            ? " (Business Area Leader)"
                            : ""
                        }`
                      : "External User"}
                  {is_active === false && ` (Inactive)`}
                </p>
                {is_staff ? (
                  <p
                    className={cn(
                      "text-sm",
                      colorMode === "light" ? "text-gray-500" : "text-gray-300",
                    )}
                  >
                    {branch ? branch.name : `Branch Not Set`}
                  </p>
                ) : (
                  <p
                    className={cn(
                      "text-sm",
                      colorMode === "light" ? "text-gray-600" : "text-gray-300",
                    )}
                  >
                    {affiliation?.pk ? affiliation.name : "No Affiliations"}
                  </p>
                )}
              </BoxContainer>
            </div>

            {/* Email Address */}
            {isXlOrLarger ? (
              <div className="ml-4 w-full overflow-hidden text-ellipsis">
                <p>{email ? (email.endsWith("email.com") ? "-" : email) : email}</p>
              </div>
            ) : !isOver690 ? (
              <div className="ml-4 w-full overflow-hidden text-ellipsis">
                <p>
                  {email
                    ? email.endsWith("email.com")
                      ? "(Not Provided)"
                      : email.length >= 15
                        ? `${email.substring(0, 13)}...`
                        : email
                    : "-"}
                </p>
              </div>
            ) : isLargerOrLarger ? (
              <div className="flex-1 px-4 w-full overflow-hidden text-ellipsis">
                <p>
                  {email
                    ? email.endsWith("email.com")
                      ? "(Not Provided)"
                      : email.length >= 25
                        ? `${email.substring(0, 20)}...`
                        : email
                    : "-"}
                </p>
              </div>
            ) : null}

            {/* Business Area */}
            {isXlOrLarger ? (
              <BoxContainer className="ml-4 w-full overflow-hidden text-ellipsis">
                <p>{business_area ? business_area.name : "-"}</p>
              </BoxContainer>
            ) : null}
          </div>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-lg">
          <UserProfile
            pk={pk}
            branches={branches}
            businessAreas={businessAreas}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
