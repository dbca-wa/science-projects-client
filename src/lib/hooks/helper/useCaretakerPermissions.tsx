import { checkIfDateExpired } from "@/lib/utils/checkIfDateExpired";
import {
  ICaretakerPermissions,
  ICaretakerSimpleUserData,
  IProjectData,
  IProjectMember,
  IUserMe,
} from "@/types";
import { isValid } from "date-fns";
import { useMemo } from "react";

// Constants for better maintainability
const PERMISSION_DEFAULTS = {
  userIsCaretakerOfMember: false,
  userIsCaretakerOfProjectLeader: false,
  userIsCaretakerOfBaLeader: false,
  userIsCaretakerOfAdmin: false,
};

const isValidCaretakingRelationship = (
  caretakee: ICaretakerSimpleUserData,
): boolean => {
  console.log("Checking if caretaking relationship is valid:", caretakee);
  if (!caretakee?.end_date) return true;
  const dateIsExpired = checkIfDateExpired(new Date(caretakee.end_date));
  console.log("Date expired status:", dateIsExpired);
  return !dateIsExpired;
};

// Helper function to check if a user is being caretaken for validly
const isValidCaretakeeForUser = (myData: IUserMe, userId: number): boolean => {
  return (
    myData.caretaking_for?.some(
      (caretakee) =>
        caretakee?.pk === userId && isValidCaretakingRelationship(caretakee),
    ) ?? false
  );
};

const isCaretakerRecursive = (
  myData: IUserMe,
  caretakerId: number,
  userId: number,
  visited: Set<number> = new Set(),
  users: IProjectMember[],
  depth: number = 0,
  maxDepth: number = 10,
): boolean => {
  if (!caretakerId || !userId) return false;
  if (depth >= maxDepth) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Max recursion depth reached in caretaker check");
    }
    return false;
  }
  if (visited.has(userId)) return false;

  visited.add(userId);

  const user = users.find((member) => member.user?.pk === userId)?.user;
  if (!user) return false;

  // Check if this user is being validly caretaken for
  if (isValidCaretakeeForUser(myData, userId)) return true;

  // Recursive check
  return (
    user.caretakers?.some(
      (caretaker) =>
        caretaker?.pk &&
        isValidCaretakeeForUser(myData, caretaker.pk) &&
        isCaretakerRecursive(
          myData,
          caretakerId,
          caretaker.pk,
          visited,
          users,
          depth + 1,
          maxDepth,
        ),
    ) ?? false
  );
};

const checkCaretakerOfMember = (
  myData: IUserMe,
  members: IProjectMember[],
): boolean => {
  return members.some((member) =>
    myData.caretaking_for?.some(
      (caretakee) =>
        (member?.user?.pk === caretakee?.pk &&
          isValidCaretakingRelationship(caretakee)) ||
        (caretakee?.pk &&
          member.user?.pk &&
          isValidCaretakingRelationship(caretakee) &&
          isCaretakerRecursive(
            myData,
            caretakee.pk,
            member.user.pk,
            new Set(),
            members,
          )),
    ),
  );
};

const checkCaretakerOfProjectLeader = (
  myData: IUserMe,
  members: IProjectMember[],
): boolean => {
  return members.some(
    (member) =>
      member.is_leader === true &&
      myData.caretaking_for?.some((caretakee) => {
        // Check if we're directly caretaking for the leader
        const isDirectCaretaker =
          member.user?.pk === caretakee?.pk &&
          isValidCaretakingRelationship(caretakee);

        // Check recursive caretaking relationship
        const isIndirectCaretaker =
          caretakee?.pk &&
          member.user?.pk &&
          isValidCaretakingRelationship(caretakee) &&
          isCaretakerRecursive(
            myData,
            caretakee.pk,
            member.user.pk,
            new Set(),
            members,
          );

        return isDirectCaretaker || isIndirectCaretaker;
      }),
  );
};

const checkCaretakerOfBaLeader = (
  myData: IUserMe,
  members: IProjectMember[],
  baseInformation?: IProjectData,
): boolean => {
  const baLeaderPk = baseInformation?.business_area?.leader;
  if (!baLeaderPk) return false;

  return (
    myData.caretaking_for?.some((caretakee) => {
      // Direct check
      const isDirectCaretaker =
        caretakee?.pk === baLeaderPk &&
        isValidCaretakingRelationship(caretakee);

      // Recursive check
      const isIndirectCaretaker =
        caretakee?.pk &&
        isValidCaretakingRelationship(caretakee) &&
        isCaretakerRecursive(
          myData,
          caretakee.pk,
          baLeaderPk,
          new Set(),
          members,
        );

      return isDirectCaretaker || isIndirectCaretaker;
    }) ?? false
  );
};

const isCaretakerOfSuperuser = (
  userToCheck: ICaretakerSimpleUserData,
  members: IProjectMember[],
  visited: Set<number> = new Set(),
  myData: IUserMe,
): boolean => {
  if (!userToCheck?.pk || visited.has(userToCheck.pk)) return false;
  if (!isValidCaretakingRelationship(userToCheck)) return false;

  visited.add(userToCheck.pk);

  const memberUser = members.find((m) => m.user?.pk === userToCheck.pk)?.user;
  if (memberUser?.is_superuser === true) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Found superuser in members: ${userToCheck.display_first_name}`,
      );
    }
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`Checking caretakers of: ${userToCheck.display_first_name}`);
  }

  const caretakers = memberUser?.caretakers || userToCheck.caretakers;

  return (
    caretakers?.some((caretaker) => {
      if (!caretaker || !isValidCaretakeeForUser(myData, caretaker.pk))
        return false;
      if (process.env.NODE_ENV === "development") {
        console.log(`Checking caretaker: ${caretaker.display_first_name}`);
      }
      return isCaretakerOfSuperuser(caretaker, members, visited, myData);
    }) ?? false
  );
};

const checkCaretakerOfAdmin = (
  myData: IUserMe,
  members: IProjectMember[],
): boolean => {
  return (
    myData.caretaking_for?.some((caretakee) => {
      if (!caretakee?.pk || !isValidCaretakingRelationship(caretakee))
        return false;
      return isCaretakerOfSuperuser(caretakee, members, new Set(), myData);
    }) ?? false
  );
};

const useCaretakerPermissions = (
  myData: IUserMe | undefined,
  members: IProjectMember[],
  baseInformation: IProjectData,
): ICaretakerPermissions => {
  return useMemo(() => {
    // Early return for invalid data
    if (
      !myData?.caretaking_for ||
      !Array.isArray(members) ||
      members.length === 0
    ) {
      return PERMISSION_DEFAULTS;
    }

    try {
      const permissions = {
        userIsCaretakerOfMember: checkCaretakerOfMember(myData, members),
        userIsCaretakerOfProjectLeader: checkCaretakerOfProjectLeader(
          myData,
          members,
        ),
        userIsCaretakerOfBaLeader: checkCaretakerOfBaLeader(
          myData,
          members,
          baseInformation,
        ),
        userIsCaretakerOfAdmin: checkCaretakerOfAdmin(myData, members),
      };
      logCaretakerPermissions(permissions, myData);
      return permissions;
    } catch (error) {
      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error in useCaretakerPermissions:", error);
      }
      return PERMISSION_DEFAULTS;
    }
  }, [
    myData?.pk,
    myData?.caretaking_for,
    members.map((m) => m.pk).join(","),
    baseInformation?.business_area?.leader,
  ]);
};

const logCaretakerPermissions = (
  permissions: ICaretakerPermissions,
  myData: IUserMe | undefined,
) => {
  console.log("Caretaker permissions:", permissions);
  console.log("My Data:", myData);
};

export default useCaretakerPermissions;
