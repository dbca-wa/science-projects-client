import { useEffect, useState } from "react";
import { IProjectMember } from "../../../types";

export const useCheckUserIsTeamLeader = (
  mePk: number | string | undefined,
  members: IProjectMember[]
) => {
  const [userIsLeader, setUserIsLeader] = useState<boolean>(false);

  useEffect(() => {
    if (mePk === undefined) {
      // console.log('user undefined')
      setUserIsLeader(false);
      return;
    }

    // If mePk is a string, try to convert it to a number
    if (typeof mePk === "string") {
      // console.log('user string, converting')
      mePk = parseInt(mePk, 10);
    }

    const leaderInTeam = members.find(
      (member) => member.is_leader && member.user?.pk === mePk
    );

    if (leaderInTeam) {
      setUserIsLeader(true);
    } else {
      setUserIsLeader(false);
    }
  }, [mePk, members]);

  return userIsLeader;
};
