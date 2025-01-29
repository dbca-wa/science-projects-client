import {
  ICaretakerPermissions,
  ICaretakerSimpleUserData,
  IProjectData,
  IProjectMember,
  IUserMe,
} from "@/types";
import { useMemo } from "react";

// Constants for better maintainability
const PERMISSION_DEFAULTS = {
  userIsCaretakerOfMember: false,
  userIsCaretakerOfProjectLeader: false,
  userIsCaretakerOfBaLeader: false,
  userIsCaretakerOfAdmin: false,
};

const isCaretakerRecursive = (
  caretakerId: number,
  userId: number,
  visited: Set<number> = new Set(),
  users: IProjectMember[],
  depth: number = 0,
  maxDepth: number = 10, // Prevent deep recursion
): boolean => {
  // Early exit conditions
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

  // Direct check
  const isDirectCaretaker =
    user.caretakers?.some((caretaker) => caretaker?.pk === caretakerId) ??
    false;

  if (isDirectCaretaker) return true;

  // Recursive check with depth tracking
  return (
    user.caretakers?.some(
      (caretaker) =>
        caretaker?.pk &&
        isCaretakerRecursive(
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

// Separate complex checks into their own functions for better testing and maintenance
const checkCaretakerOfMember = (
  myData: IUserMe,
  members: IProjectMember[],
): boolean => {
  console.log("Members:", members);
  return members.some((member) =>
    myData.caretaking_for?.some(
      (caretakee) =>
        member?.user?.pk === caretakee?.pk ||
        (caretakee?.pk &&
          member.user?.pk &&
          isCaretakerRecursive(
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
      member.user?.caretakers?.some(
        (leaderCaretaker) =>
          leaderCaretaker?.pk === myData.pk ||
          myData.caretaking_for?.some(
            (caretakee) =>
              caretakee?.pk === leaderCaretaker?.pk ||
              (caretakee?.pk &&
                leaderCaretaker?.pk &&
                isCaretakerRecursive(
                  caretakee.pk,
                  leaderCaretaker.pk,
                  new Set(),
                  members,
                )),
          ),
      ),
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
    myData.caretaking_for?.some(
      (caretakee) =>
        caretakee?.pk === baLeaderPk ||
        (caretakee?.pk &&
          isCaretakerRecursive(caretakee.pk, baLeaderPk, new Set(), members)),
    ) ?? false
  );
};

// Recursive function to check if any user in the caretaker chain is a superuser
// Recursive function to check if any user in the caretaker chain is a superuser
const isCaretakerOfSuperuser = (
  userToCheck: ICaretakerSimpleUserData,
  members: IProjectMember[],
  visited: Set<number> = new Set(),
): boolean => {
  if (!userToCheck?.pk || visited.has(userToCheck.pk)) return false;
  visited.add(userToCheck.pk);

  // First check if the user is in members list and is a superuser
  const memberUser = members.find((m) => m.user?.pk === userToCheck.pk)?.user;
  if (memberUser?.is_superuser === true) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Found superuser in members: ${userToCheck.display_first_name}`,
      );
    }
    return true;
  }

  // If not in members or not a superuser, check who they're caretaking for
  if (process.env.NODE_ENV === "development") {
    console.log(`Checking caretakers of: ${userToCheck.display_first_name}`);
  }

  // Use the caretakers from the passed user object if they're not in members
  const caretakers = memberUser?.caretakers || userToCheck.caretakers;

  return (
    caretakers?.some((caretaker) => {
      if (!caretaker) return false;
      if (process.env.NODE_ENV === "development") {
        console.log(`Checking caretaker: ${caretaker.display_first_name}`);
      }
      return isCaretakerOfSuperuser(caretaker, members, visited);
    }) ?? false
  );
};

const checkCaretakerOfAdmin = (
  myData: IUserMe,
  members: IProjectMember[],
): boolean => {
  // Check if any user we're caretaking for either:
  // 1. Is a superuser themselves
  // 2. Is caretaking for someone who is or leads to a superuser
  return (
    myData.caretaking_for?.some((caretakee) => {
      if (!caretakee?.pk) return false; // user is not caretaking for anyone, return false
      return isCaretakerOfSuperuser(caretakee, members); // Check if the caretaken user is caretaking for a superuser
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
