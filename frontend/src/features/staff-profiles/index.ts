// Types
export type {
	IStaffProfileCard,
	IStaffProfileListResponse,
	IStaffProfileHeroData,
	IStaffOverviewData,
	IStaffCVData,
	IKeywordTag,
	IEmploymentEntry,
	IEducationEntry,
	IStaffProfileProject,
	IEmploymentEntryFormData,
	IEducationEntryFormData,
	IOverviewUpdateData,
} from "./types/staff-profile.types";

// Services
export {
	getStaffProfiles,
	getStaffProfileHero,
	getStaffProfileOverview,
	getStaffProfileCV,
	getStaffProfileProjects,
	updateStaffProfileOverview,
	toggleStaffProfileVisibility,
	createEmploymentEntry,
	updateEmploymentEntry,
	deleteEmploymentEntry,
	createEducationEntry,
	updateEducationEntry,
	deleteEducationEntry,
	emailStaffMember,
} from "./services/staff-profile.service";
