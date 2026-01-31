import { useCallback, useMemo } from "react";
import { useCurrentUser } from "@/features/auth";
import { isValidCaretaking, hasNestedCaretakee } from "@/shared/utils/caretaker.utils";
import type { IProjectMember, IProjectData } from "@/shared/types/project.types";
import type { IBusinessArea } from "@/shared/types/org.types";

// Extended project type with members for permission checking
type IProjectWithMembers = IProjectData & {
  members?: IProjectMember[];
};

/**
 * Hook to check if user can act on behalf of caretakees
 * Provides permission checking functions for caretaker relationships
 * 
 * @returns Object with permission checking functions
 * 
 * @example
 * ```tsx
 * const permissions = useCaretakerPermissions();
 * 
 * // Check if can act for specific user
 * const canActForJohn = permissions.canActForUser(johnUserId);
 * 
 * // Check if can act as project member
 * const canEditDocument = permissions.canActAsProjectMember(project.members);
 * 
 * // Check if can act as project lead
 * const canApproveDocument = permissions.canActAsProjectLead(project);
 * ```
 */
export const useCaretakerPermissions = () => {
  const { data: user } = useCurrentUser();
  
  /**
   * Check if user can act on behalf of a specific user
   * Checks both direct and nested caretaking relationships
   * 
   * @param targetUserId - User ID to check
   * @returns True if user can act for target user
   */
  const canActForUser = useCallback((targetUserId: number): boolean => {
    if (!user?.caretaking_for) return false;
    
    // Check direct caretaking
    const isDirectCaretaker = user.caretaking_for.some(
      (caretakee) => caretakee.id === targetUserId && isValidCaretaking(caretakee)
    );
    
    if (isDirectCaretaker) return true;
    
    // Check nested caretaking
    return user.caretaking_for.some((caretakee) =>
      isValidCaretaking(caretakee) && hasNestedCaretakee(caretakee, targetUserId)
    );
  }, [user?.caretaking_for]);
  
  /**
   * Check if user can act as a project member
   * Returns true if user is caretaking for any project member
   * 
   * @param members - Array of project members
   * @returns True if user can act as project member
   */
  const canActAsProjectMember = useCallback((members: IProjectMember[]): boolean => {
    if (!members || members.length === 0) return false;
    
    return members.some((member) =>
      canActForUser(member.user.id)
    );
  }, [canActForUser]);
  
  /**
   * Check if user can act as a project lead
   * Returns true if user is caretaking for the project lead
   * 
   * @param project - Project object
   * @returns True if user can act as project lead
   */
  const canActAsProjectLead = useCallback((project: IProjectWithMembers): boolean => {
    if (!project?.members) return false;
    
    return project.members.some(
      (member: IProjectMember) => member.is_leader && canActForUser(member.user.id)
    );
  }, [canActForUser]);
  
  /**
   * Check if user can act as a business area lead
   * Returns true if user is caretaking for a business area lead
   * 
   * @param businessArea - Business area object
   * @returns True if user can act as business area lead
   */
  const canActAsBusinessAreaLead = useCallback((businessArea: IBusinessArea | undefined): boolean => {
    if (!businessArea?.leader) return false;
    
    // leader is a number (user ID)
    return canActForUser(businessArea.leader);
  }, [canActForUser]);
  
  return useMemo(() => ({
    canActForUser,
    canActAsProjectMember,
    canActAsProjectLead,
    canActAsBusinessAreaLead,
  }), [canActForUser, canActAsProjectMember, canActAsProjectLead, canActAsBusinessAreaLead]);
};
