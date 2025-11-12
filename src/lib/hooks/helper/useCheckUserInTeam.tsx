import { useEffect, useState } from "react";
import { IProjectMember } from "@/types";

export const useCheckUserInTeam = (
  mePk: number | string | undefined,
  members: IProjectMember[],
) => {
  const [userInTeam, setUserInTeam] = useState<boolean>(false);

  useEffect(() => {
    if (mePk === undefined) {
      setUserInTeam(false);
      return;
    }

    // If mePk is a string, try to convert it to a number
    if (typeof mePk === "string") {
      // console.log('user string, converting')
      mePk = parseInt(mePk, 10);
    }

    // Use the some() method to check if mePk is equal to the pk of any member in the team
    const isInTeam = members.some((member) => member.user?.pk === mePk);
    setUserInTeam(isInTeam);
  }, [mePk, members]);

  return userInTeam;
};
