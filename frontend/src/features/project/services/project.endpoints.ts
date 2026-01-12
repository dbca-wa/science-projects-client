export const PROJECT_ENDPOINTS = {
	// base
	// user
	TOGGLE_USER_PROFILE_VISIBILITY: (projectPk: number) =>
		`projects/${projectPk}/toggle_user_profile_visibility`,
	PROJECT_MEMBERS_LEADER: (pk: number) =>
		`projects/project_members/${pk}/leader`,
	// admin
	LIST_PROBLEMATIC: "projects/problematic",
	LIST_UNAPPROVED_FY: "projects/unapprovedFY",
	REMEDY: {
		MEMBERLESS: "projects/remedy/memberless",
		OPEN_CLOSED: "projects/remedy/open_closed",
		LEADERLESS: "projects/remedy/leaderless",
		MULTIPLE_LEADERS: "projects/remedy/multiple_leaders",
		EXTERNAL_LEADERS: "projects/remedy/external_leaders",
	},
};
