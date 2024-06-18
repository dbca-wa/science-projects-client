import { ICommentReaction } from "@/components/RichTextEditor/Editors/Sections/CommentDisplayRTE";
import { QueryFunctionContext } from "@tanstack/react-query";
import axios, { AxiosHeaders } from "axios";
import Cookie from "js-cookie";
import {
	BusinessAreaImage,
	EditorSections,
	EditorSubsections,
	EditorType,
	IAddLocationForm,
	IAddress,
	IAdminOptions,
	IAffiliation,
	IApproveDocument,
	IBranch,
	IBusinessArea,
	IBusinessAreaCreate,
	IDepartmentalService,
	IDivision,
	IFeedback,
	IMergeAffiliation,
	IPersonalInformation,
	IProfile,
	IProgressReport,
	IProjectLeadsEmail,
	IProjectMember,
	IQuickTask,
	IReport,
	IReportCreation,
	ISearchTerm,
	ISimpleLocationData,
	OrganisedLocationData,
} from "../types";
import { IConceptPlanGenerationData } from "../types";

// INSTANCE SETUP ==================================================================

const VITE_PRODUCTION_BACKEND_API_URL = import.meta.env
	.VITE_PRODUCTION_BACKEND_API_URL;
const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
	.VITE_PRODUCTION_BACKEND_BASE_URL;

const baseBackendUrl =
	process.env.NODE_ENV === "development"
		? "http://127.0.0.1:8000/api/v1/"
		: VITE_PRODUCTION_BACKEND_API_URL;

const instance = axios.create({
	baseURL: baseBackendUrl,
	withCredentials: true,
});

// Intercept and inject csrf every request (up to date and dynamic)
instance.interceptors.request.use((config) => {
	const csrfToken = Cookie.get("csrftoken") || "";
	config.headers["X-CSRFToken"] = csrfToken;
	// console.log(config.headers);
	return config;
});

// AUTHENTICATION ==============================================================

export const getSSOMe = () => {
	instance.get(`users/me`).then((response) => response.data);
};

export interface IUserCredentials {
	username: string | undefined;
	password: string | undefined;
}

export interface IUserAuthCheckVariables {
	userID: number;
}

export interface IUsernameLoginVariables {
	username: string;
	password: string;
}

export interface IUsernameLoginSuccess {
	ok: string;
}

export interface IUsernameLoginError {
	error: string;
	message: string;
}

export const logInOrdinary = ({
	username,
	password,
}: IUsernameLoginVariables): Promise<IUsernameLoginSuccess> => {
	// console.log(instance.defaults.baseURL);

	return instance
		.post(`users/log-in`, { username, password })
		.then((response) => {
			if (response.data.ok) {
				return response.data;
			} else {
				throw new Error("Please check your credentials and try again.");
			}
		})
		.catch((error) => {
			throw error;
		});
};

export const logOut = () => {
	return instance
		.post(`users/log-out`, null)
		.then((response) => {
			if (response.data) {
				// if (process.env.NODE_ENV !== "development") {
				return response.data;
				// window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}sso/auth_logout`
				// } else {
				//     re
				// }
			} else {
				throw new Error("Error logging out.", response.data.error);
			}
		})
		.catch((e) => {
			console.log(e);
			throw e;
		});
};

// USER CREATION ==============================================================

export const getDoesUserWithEmailExist = async (email: string) => {
	try {
		const response = await instance.post("users/check-email-exists", {
			email,
		});
		const { exists } = response.data;
		// console.log(exists ? 'User exists' : 'User does not exist');
		return exists;
	} catch (error) {
		console.error("Error checking user by email:", error);
		throw error;
	}
};

interface NameData {
	firstName: string;
	lastName: string;
}

export const getDoesUserWithFullNameExist = async ({
	firstName,
	lastName,
}: NameData) => {
	try {
		const response = await instance.post("users/check-name-exists", {
			first_name: firstName,
			last_name: lastName,
		});
		const { exists } = response.data;
		return exists;
	} catch (error) {
		console.error("Error checking user by full name:", error);
		throw error;
	}
};

export interface UserData {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	isStaff?: boolean;
}

export const createUser = async (userData: UserData) => {
	try {
		const response = await instance.post("users/", userData);
		return response.data;
	} catch (error) {
		console.error("Error creating user:", error);
		throw error;
	}
};

export const getUserLastOnlineTimestamp = async (userId: string) => {
	try {
		const res = await instance.get(`users/lastOnline/${userId}`);
		return res.data;
	} catch (error) {
		console.error("Failed to fetch last online timestamp:", error);
		throw error;
	}
};

// DASHBOARD ==========================================================

export const getQuote = async () => {
	return instance.get(`quotes/random/`).then((res) => res.data);
};

export const getEndorsementsPendingMyAction = () => {
	const res = instance
		.get(`documents/endorsements/pendingmyaction`)
		.then((res) => {
			return res.data;
		});
	return res;
};

// Separated queries (faster, hits db more)
export const getDocumentsPendingStageOneAction = () => {
	const res = instance
		.get(`documents/projectdocuments/pendingmyaction/stage1`)
		.then((res) => {
			return res.data;
		});
	return res;
};
export const getDocumentsPendingStageTwoAction = () => {
	const res = instance
		.get(`documents/projectdocuments/pendingmyaction/stage2`)
		.then((res) => {
			return res.data;
		});
	return res;
};

export const getDocumentsPendingStageThreeAction = () => {
	const res = instance
		.get(`documents/projectdocuments/pendingmyaction/stage3`)
		.then((res) => {
			return res.data;
		});
	return res;
};

// All in one (takes longer as all done in one query)
export const getDocumentsPendingMyAction = () => {
	const res = instance
		.get(`documents/projectdocuments/pendingmyaction`)
		.then((res) => {
			return res.data;
		});
	return res;
};

export const getDocumentComments = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance
		.get(`documents/projectdocuments/${pk}/comments`)
		.then((res) => res.data);
	return res;
};

export interface DocumentCommentCreationProps {
	documentId: number;
	payload: string;
	user: number;
}
export const createDocumentComment = async ({
	documentId,
	payload,
	user,
}: DocumentCommentCreationProps) => {
	const postContent = {
		user,
		payload,
	};
	// console.log("postContent", postContent)
	const res = instance
		.post(`documents/projectdocuments/${documentId}/comments`, postContent)
		.then((res) => res.data);
	return res;
};

export const getMyProjects = async () => {
	const res = instance.get(`projects/mine`).then((res) => {
		return res.data;
	});
	return res;
};

export const getMyPartnerships = async () => {
	const res = instance.get(`partnerships/mine`).then((res) => {
		return res.data;
	});
	return res;
};

// USERS ======================================================

export interface AdminSwitchVar {
	userPk: number | string;
}

export const switchAdmin = async ({ userPk }: AdminSwitchVar) => {
	const res = instance.post(`users/${userPk}/admin`).then((res) => {
		return res.data;
	});
	return res;
};

export interface PRPopulationVar {
	writeable_document_kind: string;
	section: string;
	project_pk: number;
}

export const getPreviousDataForProgressReportPopulation = async ({
	writeable_document_kind,
	section,
	project_pk,
}: PRPopulationVar) => {
	const res = instance
		.post(`documents/get_previous_reports_data`, {
			writeable_document_kind,
			section,
			project_pk,
		})
		.then((res) => res.data);
	return res;
};

export const deleteUserAdmin = async ({ userPk }: AdminSwitchVar) => {
	const res = instance.delete(`users/${userPk}`).then((res) => {
		return res.data;
	});
	return res;
};

export const batchApproveOLDProgressAndStudentReports = async () => {
	const res = instance.post(`documents/batchapproveold`).then((res) => {
		return res.data;
	});
	return res;
};

export const sendEmailToProjectLeads = async ({
	shouldDownloadList,
}: IProjectLeadsEmail) => {
	const data = {
		shouldDownloadList,
	};
	const res = instance
		.post(`documents/send_email_to_project_leads`, data)
		.then((res) => {
			return res.data;
		});
	return res;
};

export const batchApproveProgressAndStudentReports = async () => {
	const res = instance.post(`documents/batchapprove`).then((res) => {
		return res.data;
	});
	return res;
};

export interface INewCycle {
	alsoUpdate: boolean;
	shouldSendEmails: boolean;
	shouldPrepopulate: boolean;
}

export const openNewCycle = async ({
	alsoUpdate,
	shouldSendEmails,
	shouldPrepopulate,
}: INewCycle) => {
	console.log({ shouldPrepopulate, shouldSendEmails, alsoUpdate });
	// return "hi"
	const res = instance
		.post(`documents/opennewcycle`, {
			update: alsoUpdate,
			send_emails: shouldSendEmails,
			prepopulate: shouldPrepopulate,
		})
		.then((res) => {
			return res.data;
		});
	return res;
};

export const deactivateUserAdmin = async ({ userPk }: AdminSwitchVar) => {
	const res = instance.post(`users/${userPk}/toggleactive`).then((res) => {
		return res.data;
	});
	return res;
};

export const getMe = async () => {
	const res = instance.get(`users/me`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export interface IApproveProgressReport {
	kind: "studentreport" | "progressreport";
	isActive: number;
	reportPk: number;
	documentPk: number;
}

export const approveProgressReport = async ({
	isActive,
	kind,
	reportPk,
	documentPk,
}: IApproveProgressReport) => {
	// console.log({
	//     kind,
	//     reportPk,
	//     documentPk, isActive,
	// })
	const res = instance
		.post(`documents/actions/finalApproval`, {
			kind,
			reportPk,
			documentPk,
			isActive: isActive.toString() === "1" ? true : false,
		})
		.then((res) => {
			return res.data;
		});
	return res;
};

export const getTeamLead = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;

	// console.log(pk)
	const res = instance
		.get(`projects/project_members/${pk}/leader`)
		.then((res) => {
			return res.data;
		});
	return res;
};
getTeamLead;

// interface IFullUserProps {
//     pk: string;
// }

export const getFullUser = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	if (pk !== undefined && pk !== null && pk !== 0) {
		const res = instance.get(`users/${pk}`).then((res) => {
			return res.data;
		});
		return res;
	} else return null;
};

export const getSingleUser = async ({ queryKey }: QueryFunctionContext) => {
	const [_, userPk] = queryKey;
	return instance.get(`users/${userPk}`).then((res) => {
		// console.log(res.data);
		return res.data;
	});
};

export const getUsersBasedOnSearchTerm = async (
	searchTerm: string,
	page: number,
	filters: any
) => {
	try {
		let url = `users/?page=${page}`;

		if (searchTerm !== "") {
			url += `&searchTerm=${searchTerm}`;
		}

		if (filters.onlyExternal) {
			url += "&only_external=true";
		}

		if (filters.onlyStaff) {
			url += "&only_staff=true";
		}

		if (filters.onlySuperuser) {
			url += "&only_superuser=true";
		}

		if (filters.businessArea) {
			url += `&businessArea=${filters.businessArea}`;
		}

		// console.log(url)

		const response = await instance.get(url);

		const { users, total_results, total_pages } = response.data;
		return { users, total_results, total_pages };
	} catch (error) {
		console.error("Error fetching users based on search term:", error);
		throw error;
	}
};

export const getInternalUsersBasedOnSearchTerm = async (
	searchTerm: string,
	onlyInternal: boolean,
	projectPk?: number
) => {
	try {
		let url = `users/smallsearch`;

		if (searchTerm !== "") {
			url += `?searchTerm=${searchTerm}`;
		}

		url += `${searchTerm ? "&" : "?"}onlyInternal=${onlyInternal === undefined || onlyInternal == false ? "False" : "True"}`;
		if (projectPk) {
			url += `${searchTerm || onlyInternal ? "&" : "?"}fromProject=${projectPk}`;
		}
		const response = await instance.get(url);

		const { users } = response.data;
		return { users };
	} catch (error) {
		console.error("Error fetching users based on search term:", error);
		throw error;
	}
};

export const getUsers = async () => {
	try {
		const response = await instance.get("users/");
		return response.data;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

// USER PROFILE ========================================================

export interface IProfileUpdateVariables {
	userPk: string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
}
export interface IProfileUpdateSuccess {
	ok: string;
}

export interface IProfileUpdateError {
	error: string;
	response: {
		data: string;
	};
}
export interface IPIUpdateVariables {
	userPk: string;
	title: string;
	phone: string;
	fax: string;
}

export interface MutationSuccess {
	ok: string;
}

export interface ProjectCreationMutationSuccess {
	pk: number;
	kind: string;
}

interface IMutationResponse {
	data: Record<string, string>;
	headers: AxiosHeaders;
	request: XMLHttpRequest;
	status: number;
	statusText: string;
}

export interface MutationError {
	code: string;
	message: string;
	name: string;
	response: IMutationResponse;
}

export interface IPIUpdateSuccess {
	ok: string;
}

export interface IPIUpdateError {
	error: string;
}

export const getPersonalInformation = ({
	queryKey,
}: QueryFunctionContext): Promise<IPersonalInformation> => {
	const [_, userId] = queryKey;
	return instance.get(`users/${userId}/pi`).then((res) => res.data);
};

export const getProfile = ({
	queryKey,
}: QueryFunctionContext): Promise<IProfile> => {
	const [_, userId] = queryKey;
	// console.log(userId)
	return instance.get(`users/${userId}/profile`).then((res) => res.data);
};

export interface IFullUserUpdateVariables {
	userPk: string | number;
	title: string;
	phone: string;
	fax: string;
	branch: number | string;
	business_area: number | string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
	affiliation?: IAffiliation | number;
}

export const adminUpdateUser = async ({
	userPk,
	title,
	phone,
	fax,
	branch,
	business_area,
	image,
	about,
	expertise,
	affiliation,
}: IFullUserUpdateVariables) => {
	console.log({
		userPk,
		title,
		phone,
		fax,
		branch,
		business_area,
		image,
		about,
		expertise,
		affiliation,
	});

	try {
		// console.log(branch)
		// console.log(business_area)

		const membershipData = {
			affiliation:
				typeof affiliation === "string"
					? Number(affiliation)
					: (affiliation as IAffiliation)?.pk,
			userPk: userPk,
			branch: branch !== null && branch !== "" ? Number(branch) : 0,
			business_area:
				business_area !== null && business_area !== ""
					? Number(business_area)
					: 0,
		};
		console.log(membershipData);
		await updateMembership(membershipData);

		if (image !== undefined && image !== null) {
			const profileData = {
				userPk: userPk.toString(),
				image: image !== undefined && image !== null ? image : "",
				about: about !== undefined && about !== "" ? about : "",
				expertise:
					expertise !== undefined && expertise !== ""
						? expertise
						: "",
			};
			await updateProfile(profileData);
		} else {
			const profileData = {
				userPk: userPk.toString(),
				about: about !== undefined && about !== "" ? about : "",
				expertise:
					expertise !== undefined && expertise !== ""
						? expertise
						: "",
			};
			await updateProfile(profileData);
		}

		const piData = {
			userPk: userPk.toString(),
			title: title !== undefined && title !== "" ? title : "",
			phone: phone !== undefined && phone !== "" ? phone : "",
			fax: fax !== undefined && fax !== "" ? fax : "",
		};
		await updatePersonalInformation(piData);

		return { ok: "Update successful" };
	} catch (error: any) {
		throw new Error(error.message || "An unknown error occurred");
	}
};

export const removeUserAvatar = async ({ pk }: ISimplePkProp) => {
	const userPk = pk;
	return instance
		.post(`users/${userPk}/remove_avatar`)
		.then((res) => res.data);
};

export interface IMembershipUpdateVariables {
	userPk: string | number;
	branch: number;
	business_area: number;
	affiliation?: number;
}

export const updateMembership = async ({
	userPk,
	branch,
	business_area,
	affiliation,
}: IMembershipUpdateVariables) => {
	// console.log(userPk, branch, business_area, affiliation)
	const response = await instance.put(`users/${userPk}/membership`, {
		user_pk: userPk,
		branch_pk: branch,
		business_area: business_area,
		affiliation: affiliation,
	});
	return response.data;
};

export const updatePersonalInformation = async ({
	userPk,
	title,
	phone,
	fax,
}: IPIUpdateVariables) => {
	// console.log(
	//     userPk, title, phone, fax
	// )
	return instance
		.put(`users/${userPk}/pi`, { title, phone, fax })
		.then((res) => res.data);
};

// export const updateTeamMemberPosition = async (user_id: number, project_id: number, newPosition: number) => {
//     const data = {
//         user_id: user_id,
//         new_position: newPosition,
//     };

//     const response = await instance.put(`projects/${project_id}/team`, data);
//     return response.data; // Assuming your backend returns updated data
// };

export interface IMyBAUpdateSubmissionData {
	pk: number;
	introduction: string;
	image: File | null;
}

export const updateMyBa = async ({
	pk,
	introduction,
	image,
}: IMyBAUpdateSubmissionData) => {
	const formData = new FormData();

	if (image instanceof File) {
		formData.append("image", image);
	} else if (typeof image === "string") {
		formData.append("image", image);
	}

	if (introduction !== null) {
		formData.append("introduction", introduction);
	}

	const response = await instance.put(
		`agencies/business_areas/${pk}`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);

	return response.data; // Assuming your response structure is similar to IProfileUpdateSuccess
};

export const updateProfile = async ({
	userPk,
	image,
	about,
	expertise,
}: IProfileUpdateVariables) => {
	// console.log(
	//     userPk, image, about, expertise
	// )

	const formData = new FormData();
	formData.append("userPk", userPk);

	if (about !== undefined) {
		formData.append("about", about);
	}

	if (expertise !== undefined) {
		formData.append("expertise", expertise);
	}

	if (image !== null) {
		if (image instanceof File) {
			formData.append("image", image);
		} else if (typeof image === "string") {
			formData.append("image", image);
		}
	}

	// console.log(formData);

	const response = await instance.put(`users/${userPk}/profile`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data; // Assuming your response structure is similar to IProfileUpdateSuccess
};

// return instance.put(
//     `users/${userPk}/profile`,
//     { image, about, expertise }).then(res => res.data);

// PROJECTS ==========================================================================

export const getFullProject = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance.get(`projects/${pk}`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export const getFullProjectSimple = async (preselectedProjectPk: number) => {
	try {
		const res = await instance.get(`projects/${preselectedProjectPk}`);
		// console.log(res.data);
		return res.data;
	} catch (error) {
		console.error("Error fetching project:", error);
		throw error; // You can handle errors as needed
	}
};

export interface ISetProjectProps {
	status:
		| "new"
		| "pending"
		| "active"
		| "updating"
		| "terminated"
		| "suspended"
		| "closed";
	projectId: number | string;
}

export const setProjectStatus = async ({
	projectId,
	status,
}: ISetProjectProps) => {
	const data = {
		status: status,
	};
	const res = instance.put(`projects/${projectId}`, data).then((res) => {
		return res.data;
	});
	return res;
};

export interface ISpecialEndorsement {
	projectPlanPk: number;
	shouldSendEmails?: boolean;
	aecPDFFile?: File;

	aecEndorsementRequired: boolean;
	aecEndorsementProvided: boolean;

	// herbariumEndorsementRequired: boolean;
	// herbariumEndorsementProvided: boolean;

	// bmEndorsementRequired: boolean;
	// bmEndorsementProvided: boolean;
}

export const seekEndorsementAndSave = async ({
	projectPlanPk,
	shouldSendEmails,

	aecEndorsementRequired,
	aecEndorsementProvided,
	aecPDFFile,
	// herbariumEndorsementRequired, herbariumEndorsementProvided,
	// bmEndorsementRequired, bmEndorsementProvided
}: ISpecialEndorsement) => {
	// console.log(aecPDFFile?.name)
	const formData = new FormData();
	// formData.append('bm_endorsement_required', bmEndorsementRequired.toString());
	// formData.append('bm_endorsement_provided', bmEndorsementProvided.toString());
	// formData.append('hc_endorsement_required', herbariumEndorsementRequired.toString());
	// formData.append('hc_endorsement_provided', herbariumEndorsementProvided.toString());
	formData.append(
		"ae_endorsement_required",
		aecEndorsementRequired.toString()
	);
	formData.append(
		"ae_endorsement_provided",
		aecEndorsementRequired === false
			? aecEndorsementRequired.toString()
			: aecEndorsementProvided.toString()
	);

	if (aecPDFFile !== undefined && aecPDFFile !== null) {
		formData.append("aec_pdf_file", aecPDFFile);
	}
	// console.log(
	//     formData
	// )
	// for (const pair of formData.entries()) {
	//     console.log(pair[0], pair[1]);
	// }

	// const res = instance.post(`documents/project_plan/${projectPlanPk}/seek_endorsement`, data).then(res => {
	//     return res.data
	// })
	// return res;
	return instance
		.post(
			`documents/project_plans/${projectPlanPk}/seek_endorsement`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		)
		.then((res) => res.data);
};

export const deleteAECPDFEndorsement = async (projectPlanPk: number) => {
	return instance
		.post(
			`documents/project_plans/${projectPlanPk}/delete_aec_endorsement_pdf`,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		)
		.then((res) => res.data);
};

// export const setEndorsement = async (
//     { projectPlanPk,
//         aecEndorsementRequired, aecEndorsementProvided,
//         herbariumEndorsementRequired, herbariumEndorsementProvided,
//         bmEndorsementRequired, bmEndorsementProvided,

//     }: ISpecialEndorsement) => {
//     const data = {
//         project_plan: projectPlanPk,

//         bm_endorsement_required: bmEndorsementRequired,
//         bm_endorsement_provided: bmEndorsementRequired ? bmEndorsementProvided : false,

//         ae_endorsement_required: aecEndorsementRequired,
//         ae_endorsement_provided: aecEndorsementRequired ? aecEndorsementProvided : false,

//         hc_endorsement_required: herbariumEndorsementRequired,
//         hc_endorsement_provided: herbariumEndorsementRequired ? herbariumEndorsementProvided : false,
//     }
//     const res = instance.put(`documents/project_plan/${projectPlanPk}`, data).then(res => {
//         return res.data
//     })
//     return res;
// }

export interface INewMember {
	user: number;
	project: number;
	role: string;
	timeAllocation: number;
	shortCode?: number;
	comments?: string;
	isLeader?: boolean;
	position?: number;
	oldId?: number;
}

export const createTeamMember = async ({
	user,
	project,
	role,
	timeAllocation,
	shortCode,
	comments,
}: INewMember) => {
	const data = {
		user: user,
		project: project,
		role: role,
		time_allocation: timeAllocation,
		short_code: shortCode,
		comments: comments,
		is_leader: false,
		position: 100,
		old_id: 1,
	};

	// console.log(data);

	const response = await instance.post(`projects/project_members`, data);
	return response.data;
};

export type RemoveUserMutationType = {
	user: number;
	project: number;
};

export const removeTeamMemberFromProject = async (
	formData: RemoveUserMutationType
) => {
	// console.log(formData);

	const response = await instance.delete(
		`projects/project_members/${formData.project}/${formData.user}`
	);
	// console.log(response.data === "");
	// console.log(response.status);
	return response;
};

export const updateProjectMember = async (formData: any) => {
	// console.log(formData);

	const projectId = formData.projectPk;
	const userId = formData.userPk;
	const shortCode = formData.shortCode;
	const fte = formData.fte;
	const role = formData.role;

	const response = await instance.put(
		`projects/project_members/${projectId}/${userId}`,
		{
			role: role,
			time_allocation: fte,
			short_code: shortCode,
		}
	);

	// console.log(response.data === "");
	// console.log(response.status);
	return response.data;
};

export const promoteUserToLeader = async (formData: RemoveUserMutationType) => {
	// console.log(formData);

	const response = await instance.post(`projects/promote`, {
		user: formData.user,
		project: formData.project,
	});

	// console.log(response.data === "");
	// console.log(response.status);
	return response.data;
};

export const updateTeamMemberPosition = async (
	project_id: number,
	reorderedTeam: IProjectMember[]
) => {
	const data = {
		reordered_team: reorderedTeam, // Include the reorderedTeam data in the request
	};

	const response = await instance.put(`projects/${project_id}/team`, data);
	return response.data.sorted_team; // Assuming your backend returns sorted_team
};

export const getProjectTeam = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance.get(`projects/${pk}/team`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export const getDirectorateMembers = async ({
	queryKey,
}: QueryFunctionContext) => {
	// GET DIRECTORATE FROM BACKEND HERE!!
	const res = instance.get(`users/directorate`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

// export const setUserFTE = async () => {
//     return res
// }

// export const setUserRole = async () => {
//     return res
// }

// export const setUserPosition = async () => {
//     return res
// }

// PROJECT CRUD ==========================================================================

export interface ICreateProjectBaseInfo {
	creator: number;
	kind: string;
	year: number;

	title: string;
	description: string;
	keywords: string[] | [];
	imageData: File | null;
}

export interface ICreateProjectDetails {
	dataCustodian: number;
	projectLead: number;
	departmentalService: number;
	businessArea: number;
	startDate: Date;
	endDate: Date;
	// dates: Date[];
}

export interface ICreateProjectExternalDetails {
	externalDescription: string;
	aims: string;
	budget: string;
	collaborationWith: string;
}
export interface ICreateProjectStudentDetails {
	level: string;
	organisation: string;
}

export interface IProjectCreationVariables {
	baseInformationData: ICreateProjectBaseInfo;
	detailsData: ICreateProjectDetails;
	locationData: number[];
	externalData: ICreateProjectExternalDetails;
	studentData: ICreateProjectStudentDetails;
	isExternalSP?: boolean;
}

export const createProject = async ({
	baseInformationData,
	detailsData,
	locationData,
	externalData,
	studentData,
	isExternalSP,
}: IProjectCreationVariables) => {
	// console.log(
	//     baseInformationData, detailsData, locationData, externalData, studentData
	// )

	const formData = new FormData();
	formData.append("year", baseInformationData.year.toString());
	formData.append("kind", baseInformationData.kind);
	formData.append("creator", baseInformationData.creator.toString());
	formData.append("title", baseInformationData.title);
	formData.append("description", baseInformationData.description);
	formData.append("keywords", baseInformationData.keywords.join(", "));
	if (isExternalSP) {
		// console.log(`Is External: ${isExternalSP}`)
		formData.append("isExternalSP", isExternalSP.toString());
	}

	if (baseInformationData.imageData !== null) {
		if (baseInformationData.imageData instanceof File) {
			formData.append("imageData", baseInformationData.imageData);
		} else if (typeof baseInformationData.imageData === "string") {
			formData.append("imageData", baseInformationData.imageData);
		}
	}

	formData.append("businessArea", detailsData.businessArea.toString());

	if (detailsData.departmentalService) {
		formData.append(
			"departmentalService",
			detailsData.departmentalService.toString()
		);
	}
	formData.append("dataCustodian", detailsData.dataCustodian.toString());
	formData.append("projectLead", detailsData.projectLead.toString());

	if (detailsData.startDate) {
		formData.append("startDate", detailsData.startDate.toISOString());
	}
	if (detailsData.endDate) {
		formData.append("endDate", detailsData.endDate.toISOString());
	}
	// detailsData.dates.forEach((date, index) => {
	//     formData.append('dates', date.toISOString());
	// });

	locationData.forEach((location, index) => {
		formData.append("locations", location.toString());
	});

	if (baseInformationData.kind === "student") {
		formData.append("organisation", studentData.organisation);
		formData.append("level", studentData.level);
	} else if (baseInformationData.kind === "external") {
		formData.append(
			"externalDescription",
			externalData.externalDescription
		);
		formData.append("aims", externalData.aims);
		formData.append("budget", externalData.budget);
		formData.append("collaborationWith", externalData.collaborationWith);
	}

	// console.log(formData);

	return instance
		.post(`projects/`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((res) => res.data);
};

export interface IEditProject {
	projectPk: string | number;
	title: string;
	description?: string;
	status?:
		| "new"
		| "pending"
		| "active"
		| "updating"
		| "terminated"
		| "suspended"
		| "closed";
	image?: File | null;
	selectedImageUrl: string | null;
	locations: number[];
	keywords: string[];

	// dates: Date[];
	startDate: Date;
	endDate: Date;
	dataCustodian: number;
	departmentalService: number;
	businessArea: number;

	externalDescription?: string;
	aims?: string;
	budget?: string;
	collaborationWith?: string;
	level?: string;
	organisation?: string;
}

export const updateProjectDetails = async ({
	projectPk,
	title,
	description,
	keywords,
	image,
	selectedImageUrl,
	locations,

	startDate,
	endDate,
	status,
	dataCustodian,
	departmentalService,
	businessArea,

	externalDescription,
	aims,
	budget,
	collaborationWith,
	level,
	organisation,
}: IEditProject) => {
	// console.log('editing')
	// console.log('keywords:', keywords)

	const newFormData = new FormData();

	if (projectPk !== undefined && projectPk !== null) {
		newFormData.append("pk", projectPk.toString());
	}
	if (title !== undefined && title !== null) {
		newFormData.append("title", title);
	}

	if (description !== undefined && description !== null) {
		newFormData.append("description", description);
	}
	if (image !== null && image !== undefined) {
		if (image instanceof File) {
			newFormData.append("image", image);
		} else if (typeof image === "string") {
			newFormData.append("image", image);
		}
	}
	if (selectedImageUrl === null) {
		newFormData.append("selectedImageUrl", "delete");
	}

	if (status !== undefined && status !== null) {
		newFormData.append("status", status);
	}
	if (dataCustodian !== undefined && dataCustodian !== null) {
		newFormData.append("data_custodian", dataCustodian.toString());
	}
	if (keywords !== undefined && keywords !== null) {
		// const keywordString = JSON.stringify(keywords)
		newFormData.append("keywords", keywords.join(", "));
	}

	if (locations !== undefined && locations !== null) {
		if (locations.length > 0) {
			const locationsString = JSON.stringify(locations);
			newFormData.append("locations", locationsString);
		} else if (locations.length <= 0) {
			newFormData.append("locations", "[]");
		}
	} else {
		newFormData.append("locations", "[]");
	}

	if (startDate) {
		// console.log('startDate is', startDate)
		const dateFormatted = new Date(startDate);

		newFormData.append("startDate", dateFormatted.toISOString());
	}
	if (endDate) {
		// console.log('endDate is', endDate)
		const dateFormatted = new Date(endDate);

		newFormData.append("endDate", dateFormatted.toISOString());
	}

	if (departmentalService !== undefined && departmentalService !== null) {
		newFormData.append("service", departmentalService.toString());
	}

	if (businessArea !== undefined && businessArea !== null) {
		// console.log(businessArea)
		newFormData.append("businessArea", businessArea.toString());
	}

	if (
		externalDescription !== undefined &&
		externalDescription !== null &&
		externalDescription.length > 0
	) {
		newFormData.append(
			"externalDescription",
			externalDescription.toString()
		);
	}

	if (aims !== undefined && aims !== null && aims.length > 0) {
		newFormData.append("aims", aims.toString());
	}

	if (budget !== undefined && budget !== null && budget.length > 0) {
		newFormData.append("budget", budget.toString());
	}

	if (
		collaborationWith !== undefined &&
		collaborationWith !== null &&
		collaborationWith.length > 0
	) {
		newFormData.append("collaborationWith", collaborationWith.toString());
	}

	if (level !== undefined && level !== null && level.length > 0) {
		newFormData.append("level", level.toString());
	}

	if (
		organisation !== undefined &&
		organisation !== null &&
		organisation.length > 0
	) {
		newFormData.append("organisation", organisation.toString());
	}

	// console.log(newFormData);
	// console.log(data)

	const res = instance
		.put(`projects/${projectPk}`, newFormData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((d) => d.data);
	// return {
	//     'data': data,
	//     'status': 200,
	// }

	// return instance.get('google.com')
};

// export const getInternalUsersBasedOnSearchTerm = async (searchTerm: string, onlyInternal: boolean) => {
//     try {
//         let url = `users/smallsearch`;

//         if (searchTerm !== "") {
//             url += `?searchTerm=${searchTerm}`;
//         }

//         url += `&onlyInternal=${(onlyInternal === undefined || onlyInternal == false) ? "False" : "True"}`

//         const response = await instance.get(url);

//         const { users } = response.data;
//         return { users };
//     } catch (error) {
//         console.error("Error fetching users based on search term:", error);
//         throw error;
//     }
// };

// return (
//     { "status": "Ok" }
// )

export const getMyProjectsBasedOnSearchTerm = async (
	searchTerm: string,
	userPk: number
) => {
	try {
		let url = `projects/smallsearch`;

		if (userPk !== null && userPk !== 0 && userPk !== undefined) {
			if (searchTerm !== "") {
				url += `?searchTerm=${searchTerm}`;
				url += `&userPk=${userPk}`;
			} else {
				url += `?userPk=${userPk}`;
			}
		}

		const response = await instance.get(url);

		const { projects } = response.data;
		return { projects };
	} catch (error) {
		console.error("Error fetching projects based on search term:", error);
		throw error;
	}
};

export const getAllProjectsYears = async () => {
	const url = "projects/listofyears";
	const response = await instance.get(url);
	return response.data;
};

export const getProjectsBasedOnSearchTerm = async (
	searchTerm: string,
	page: number,
	filters: {
		onlyActive: boolean;
		onlyInactive: boolean;
		filterBA: string;
		filterProjectKind: string;
		filterProjectStatus: string;
		filterYear: number;
	}
) => {
	try {
		let url = `projects?page=${page}`;

		if (searchTerm !== "") {
			url += `&searchTerm=${searchTerm}`;
		}

		if (filters.onlyActive) {
			url += "&only_active=true";
		}

		if (filters.onlyInactive) {
			url += "&only_inactive=true";
		}

		if (filters.filterBA) {
			if (filters.filterBA === "All") {
				// skip to get all areas
			} else {
				url += `&businessarea=${filters.filterBA}`;
			}
		}

		if (filters.filterProjectStatus) {
			if (filters.filterProjectStatus === "All") {
				// skip to get all
			} else {
				url += `&projectstatus=${filters.filterProjectStatus}`;
			}
		}

		if (filters.filterProjectKind) {
			if (filters.filterProjectKind === "All") {
				// skip to get all
			} else {
				url += `&projectkind=${filters.filterProjectKind}`;
			}
		}
		if (filters.filterYear) {
			if (filters.filterYear === 0) {
				// skip to get all
			} else {
				url += `&year=${filters.filterYear}`;
			}
		}

		// console.log({
		//     "url": url,
		//     "filterBA": filters.filterBA,
		//     "projectStatus": filters.filterProjectStatus,
		//     "projectKind": filters.filterProjectKind,
		// })

		const response = await instance.get(url);

		const { projects, total_results, total_pages } = response.data;
		// console.log(projects)
		return { projects, total_results, total_pages };
	} catch (error) {
		console.error("Error fetching projects based on search term:", error);
		throw error;
	}
};

export const getProjects = async ({ searchTerm }: ISearchTerm) => {
	return instance
		.post("projects/", {
			searchTerm: searchTerm,
		})
		.then((res) => {
			return res.data;
		});
};

// DOCUMENTS ==========================================================================

export interface IDocGenerationProps {
	docPk: number | string;
	kind: string;
}

export const downloadProjectDocument = async ({
	docPk,
}: IDocGenerationProps) => {
	if (docPk === undefined) return;
	// console.log(docPk);
	const pk = Number(docPk);

	const url = "documents/downloadProjectDocument";
	const params = {
		document_id: pk,
	};

	return instance
		.post(url, params, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((res) => res.data);
};

// export const generateProjectDocument = async ({
//     docPk,
//     kind,
// }: IDocGenerationProps) => {
//     if (docPk === undefined) return;
//     console.log(docPk);
//     const pk = Number(docPk);
//     const url = `documents/generateProjectDocument/${pk}`
//     const params = {
//         "kind": kind,
//     }

//     instance.post(
//         url,
//         params,
//         {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         }
//     ).then(res => {
//         console.log(res.data);
//         return res.data;
//     });

// }

// export const spawnDocument = async({})

export const handleDocumentAction = async ({
	action,
	stage,
	documentPk,
	shouldSendEmail,
}: IApproveDocument) => {
	let url = "";
	if (action === "approve") {
		url = `documents/actions/approve`;
	} else if (action === "recall") {
		url = `documents/actions/recall`;
	} else if (action === "send_back") {
		url = `documents/actions/send_back`;
	} else if (action === "reopen") {
		url = `documents/actions/reopen`;
	}

	let params = {};
	if (!shouldSendEmail) {
		params = {
			action: action,
			stage: stage,
			documentPk: documentPk,
			shouldSendEmail: false,
		};
	} else {
		params = {
			action: action,
			stage: stage,
			documentPk: documentPk,
			shouldSendEmail: true,
		};
	}

	// console.log(params)

	return instance
		.post(url, params, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((res) => res.data);
};

// export const handleProgressReportAction = async ({ action, stage, documentPk, progressReportPk }: IApproveProgressReport) => {

//     let url = ""
//     if (action === "approve") {
//         url = `documents/progressreports/approve`
//     } else if (action === "recall") {
//         url = `documents/progressreports/recall`

//     } else if (action === "send_back") {
//         url = `documents/progressreports/send_back`
//     }
//     const params = {
//         "action": action,
//         "stage": stage,
//         "documentPk": documentPk,
//         "progressReportPk": progressReportPk,
//     }
//     console.log(params)

//     return instance.post(
//         url,
//         params,
//         {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         }
//     ).then(res => res.data);
// }

// export const recallProgressReport = async ({ stage, documentPk, progressReportPk }: IApproveProgressReport) => {
//     const url = `documents/progressreports/recall`
//     const params = {
//         "stage": stage,
//         "documentPk": documentPk,
//         "progressReportPk": progressReportPk,
//     }
//     console.log(params)

//     return instance.post(
//         url,
//         params,
//         {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         }
//     ).then(res => res.data);
// }

export const getProgressReportForYear = async (
	year: number,
	project: number
) => {
	const url = `documents/progressreports/${project}/${year}`;
	const progressReportData = await instance.get(url).then((res) => res.data);
	// console.log(progressReportData);
	return progressReportData;
};

export interface IAddPDF {
	reportId: number;
	userId: number;
	pdfFile: File;
}

export interface IUpdatePDF {
	reportMediaId: number;
	// userId: number;
	pdfFile: File;
}

export const deleteFinalAnnualReportPDF = async (annualReportPDFPk: number) => {
	// console.log(annualReportPDFPk);

	const res = await instance.delete(
		`medias/report_pdfs/${annualReportPDFPk}`
	);
	// console.log(res);
	return res.data;
};

export const updateReportPDF = async ({
	reportMediaId,
	// userId,
	pdfFile,
}: IUpdatePDF) => {
	// console.log({
	//     // userId,
	//     reportMediaId,
	//     pdfFile
	// })

	const formData = new FormData();
	function isFileArray(obj: any): obj is File[] {
		return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
	}

	if (pdfFile instanceof File) {
		formData.append("file", pdfFile);
	} else if (isFileArray(pdfFile)) {
		const firstFile = pdfFile[0];
		formData.append("file", firstFile);
	} else {
		console.error(
			"pdfFile is not a valid File object or array. Type:",
			typeof pdfFile
		);
		// Handle the error or log additional information as needed
	}

	// formData.append('file', pdfFile, pdfFile.name); // Make sure pdfFile is a File object
	// formData.append('user', userId.toString());
	// formData.append('report', reportMediaId.toString());

	// console.log(';formdata is')
	// console.log(formData)

	const res = await instance.put(
		`medias/report_pdfs/${reportMediaId}`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
	// console.log(res);
	return res.data;
};

export const addPDFToReport = async ({
	reportId,
	userId,
	pdfFile,
}: IAddPDF) => {
	// console.log({
	//     userId,
	//     reportId,
	//     pdfFile
	// })

	const formData = new FormData();
	function isFileArray(obj: any): obj is File[] {
		return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
	}

	if (pdfFile instanceof File) {
		formData.append("file", pdfFile);
	} else if (isFileArray(pdfFile)) {
		const firstFile = pdfFile[0];
		formData.append("file", firstFile);
	} else {
		console.error(
			"pdfFile is not a valid File object or array. Type:",
			typeof pdfFile
		);
		// Handle the error or log additional information as needed
	}

	// formData.append('file', pdfFile, pdfFile.name); // Make sure pdfFile is a File object
	formData.append("user", userId.toString());
	formData.append("report", reportId.toString());

	// console.log(';formdata is')
	// console.log(formData)

	const res = await instance.post("medias/report_pdfs", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	// console.log(res);
	return res.data;
};

export interface IUploadFile {
	pk: number;
	file: File;
}

// export const startFinalAnnualReportPDFUpload = async ({ pk, file }: IUploadFile) => {
//     console.log(file, pk);
//     return true;
// }

export const getArarsWithPDFs = async () => {
	try {
		const response = await instance.get(`documents/reports/withPDF`);
		// console.log(response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching reports with pdfs:", error);
		throw error;
	}
};

export const getArarsWithoutPDFs = async () => {
	try {
		const response = await instance.get(`documents/reports/withoutPDF`);
		// console.log(response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching reports without pdfs:", error);
		throw error;
	}
};

export interface IHTMLSave {
	editorType: EditorType;
	htmlData: string;
	isUpdate: boolean;
	project_pk: null | number;
	document_pk: null | number;
	writeable_document_kind: null | EditorSections;
	writeable_document_pk: null | number;
	details_pk: number | null;
	section: null | EditorSubsections;
	softRefetch?: () => void;
	setIsEditorOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	canSave: boolean;
}

// Also have this handle directors message, research intro etc. (annual report)
export const saveHtmlToDB = async ({
	editorType,
	htmlData,
	details_pk,
	project_pk,
	document_pk,
	writeable_document_kind,
	writeable_document_pk,
	section,
	isUpdate,
	canSave,
}: IHTMLSave) => {
	const urlType = isUpdate ? instance.put : instance.post;

	if (editorType === "ProjectDetail") {
		// Null document is okay - that will be handled on the backend (as the description)
		// if document is None and section is not None, make changes to the projects title or description
		// based on section
		// const data = {
		//     "html": htmlData,
		//     "project": project_pk,
		//     "section": section,
		// }
		// console.log(data)
		// GO to project endpoint
		let params;
		if (section === "description") {
			params = {
				description: htmlData,
			};
			return urlType(`projects/${project_pk}`, params, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}).then((res) => res.data);

			// EXTERNAL PROJECTS
		} else if (section === "externalAims") {
			params = {
				aims: htmlData,
			};
			return urlType(
				`projects/external_project_details/${details_pk}`,
				params,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			).then((res) => res.data);
		} else if (section === "externalDescription") {
			params = {
				description: htmlData,
			};
			return urlType(
				`projects/external_project_details/${details_pk}`,
				params,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			).then((res) => res.data);
		}
	} else if (editorType === "ProjectDocument") {
		const data = {
			html: htmlData,
			project: project_pk,
			document: document_pk,
			section: section,
			kind: writeable_document_kind,
			kind_pk: writeable_document_pk,
		};
		// console.log(data)
		const params = {
			[section]: htmlData,
		};
		// if (section === "description") {
		//     params = {
		//         "description": htmlData,
		//     }
		// }
		const formatDocumentKind = (writeable_document_kind) => {
			// Remove spaces and convert the string to lowercase, then add 's' to the end
			return (
				writeable_document_kind.replace(/\s/g, "").toLowerCase() + "s"
			);
		};
		const formattedKind = formatDocumentKind(writeable_document_kind);

		// console.log(`documents/${formattedKind}/${writeable_document_pk}`)
		// console.log(params)

		return urlType(
			`documents/${formattedKind}/${writeable_document_pk}`,
			params,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		).then((res) => res.data);
	} else if (editorType === "AnnualReport") {
		const url = `documents/reports/${writeable_document_pk}`;
		const payload = {
			[section]: htmlData,
		};
		return urlType(url, payload).then((res) => res.data);
	}
};

export type GuideSections =
	| "guide_admin"
	| "guide_about"
	| "guide_login"
	| "guide_profile"
	| "guide_user_creation"
	| "guide_user_view"
	| "guide_project_creation"
	| "guide_project_view"
	| "guide_project_team"
	| "guide_documents"
	| "guide_report";

export interface IHTMLGuideSave {
	htmlData: string;
	isUpdate: boolean;
	adminOptionsPk: null | number;
	section: null | GuideSections;
	softRefetch?: () => void;
	setIsEditorOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	canSave: boolean;
}

export const saveGuideHtmlToDB = async ({
	htmlData,
	adminOptionsPk,
	section,
	isUpdate,
	canSave,
}: IHTMLGuideSave) => {
	const urlType = isUpdate ? instance.put : instance.post;
	const params = {
		[section]: htmlData,
	};
	return urlType(`adminoptions/${adminOptionsPk}`, params, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	}).then((res) => res.data);
};

export interface IHandleMethodologyImage {
	kind: string;
	project_plan_pk: number;

	file: string | File | null;
}

export const handleMethodologyImage = async ({
	kind,
	project_plan_pk,
	file,
}: IHandleMethodologyImage) => {
	if (kind === "update" || kind === "post") {
		const newFormData = new FormData();
		if (file !== null) {
			// console.log(file)
			if (file instanceof File) {
				// console.log('is file')
				newFormData.append("file", file);
			} else if (typeof file === "string") {
				// console.log('is string')
				newFormData.append("file", file);
			}
		}
		newFormData.append("pk", project_plan_pk.toString());

		if (kind === "update") {
			return instance
				.put(
					`medias/methodology_photos/${project_plan_pk}`,
					newFormData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				)
				.then((res) => res.data);
		} else if (kind === "post") {
			return instance
				.post(`medias/methodology_photos`, newFormData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((res) => res.data);
		}
	} else if (kind === "delete") {
		return instance
			.delete(`medias/methodology_photos/${project_plan_pk}`)
			.then((res) => res.data);
	}
};

export interface ISpawnDocument {
	projectPk: number;
	year?: number;
	report_id?: number;
	kind:
		| "concept"
		| "projectplan"
		| "progressreport"
		| "studentreport"
		| "studentreport"
		| "projectclosure"
		| string;
}

export interface ICloseProjectProps {
	projectKind: string;
	projectPk: number;
	reason: string;
	outcome: "forcecompleted" | "completed" | "terminated" | "suspended";
}

export interface IClosureOutcomeProps {
	outcome: string;
	closurePk: number;
}
export const setClosureOutcome = async ({
	outcome,
	closurePk,
}: IClosureOutcomeProps) => {
	const url = `documents/projectclosures/${closurePk}`;
	const params = {
		intended_outcome: outcome,
	};

	instance.put(url, params).then((res) => res.data);
};

export const closeProjectCall = async ({
	projectPk,
	reason,
	outcome,
	projectKind,
}: ICloseProjectProps) => {
	// console.log(projectPk, reason, outcome);
	if (projectPk !== undefined) {
		const url = `documents/projectdocuments`;
		const docKind = "projectclosure";

		const params = {
			project: projectPk,
			kind: docKind,
			projectKind: projectKind,
			reason: reason,
			outcome: outcome,
		};

		// console.log(params)

		return instance.post(url, params).then((res) => res.data);
	}
};

export const openProjectCall = async ({ pk }: ISimplePkProp) => {
	// console.log(projectPk, reason, outcome);
	if (pk !== undefined) {
		const url = `documents/projectclosures/reopen/${pk}`;
		const params = {
			project: pk,
		};

		// console.log(params)

		return instance.post(url, params).then((res) => res.data);
	}
};

export const suspendProjectCall = async ({ pk }: ISimplePkProp) => {
	// console.log(projectPk, reason, outcome);
	if (pk !== undefined) {
		const url = `projects/${pk}/suspend`;

		return instance.post(url).then((res) => res.data);
	}
};

export interface ISimplePkProp {
	pk: number;
}

export const deleteProjectCall = async ({ pk }: ISimplePkProp) => {
	// console.log(pk)
	if (pk !== undefined) {
		const url = `projects/${pk}`;

		return instance.delete(url).then((res) => res.data);
	}
};

export interface ISetProjectAreas {
	projectPk: number;
	areas: number[];
}

export const setProjectAreas = async ({
	areas,
	projectPk,
}: ISetProjectAreas) => {
	// console.log({ areas, projectPk })
	const url = `projects/${projectPk}/areas`;
	const params = {
		areas: areas,
	};
	return instance.put(url, params).then((res) => res.data);
};

export interface IDeleteDocument {
	projectPk: number | string;
	documentPk: number | string;
	documentKind:
		| "conceptplan"
		| "projectplan"
		| "progressreport"
		| "studentreport"
		| "projectclosure";
}

export const deleteDocumentCall = async ({
	projectPk,
	documentPk,
	documentKind,
}: IDeleteDocument) => {
	// console.log(
	//     {
	//         projectPk,
	//         documentPk,
	//         documentKind,
	//     }
	// );
	if (documentPk !== undefined) {
		const url = `documents/projectdocuments/${documentPk}`;
		return instance.delete(url).then((res) => res.data);
	}
};

export interface IDeleteComment {
	commentPk: number | string;
	documentPk: number | string;
}

export const deleteCommentCall = async ({
	commentPk,
	documentPk,
}: IDeleteComment) => {
	// console.log(
	//     {
	//         commentPk,
	//         documentPk,
	//     }
	// );
	if (documentPk !== undefined) {
		const url = `communications/comments/${commentPk}`;
		return instance.delete(url).then((res) => res.data);
	}
};

// Testing GH

export const getStudentReportForYear = async (
	year: number,
	project: number
) => {
	const url = `documents/studentreports/${project}/${year}`;
	const studentReportData = await instance.get(url).then((res) => res.data);
	// console.log(studentReportData);
	return studentReportData;
};

export const spawnNewEmptyDocument = async ({
	projectPk,
	kind,
	year,
	report_id,
}: ISpawnDocument) => {
	// console.log(projectPk, kind, year, report_id);

	const choices = [
		"concept",
		"projectplan",
		"progressreport",
		"studentreport",
		"projectclosure",
	];
	if (!choices.includes(kind)) {
		// console.log(`returning as choice is ${kind}`)
		return;
	}
	// else {
	//     console.log(
	//         "valid choice"
	//     )
	// }
	const yearAsNumber = Number(year);

	// Create the document first (as a document object)
	const url = `documents/projectdocuments`;
	const project_id = Number(projectPk);
	let params;

	if (kind === "concept") {
		params = {
			kind: "concept",
			project: project_id,
			aims: "<p></p>",
			outcome: "<p></p>",
			collaborations: "<p></p>",
			strategic_context: "<p></p>",
			// table sections ommitted as on db
		};
	} else if (kind === "projectplan") {
		params = {
			kind: "projectplan",
			project: project_id,
			background: "<p></p>",
			aims: "<p></p>",
			outcome: "<p></p>",
			knowledge_transfer: "<p></p>",
			project_tasks: "<p></p>",
			listed_references: "<p></p>",
			methodology: "<p></p>",
			// table sections ommitted as on db
			related_projects: "<p></p>",
		};
	} else if (kind === "studentreport") {
		params = {
			kind: "studentreport",
			report: report_id,
			project: project_id,
			year: yearAsNumber,
			progress_report: "<p></p>",
		};
	} else if (kind === "progressreport") {
		params = {
			kind: "progressreport",
			report: report_id,
			project: project_id,
			year: yearAsNumber,
			is_final_report: false,
			context: "<p></p>",
			aims: "<p></p>",
			progress: "<p></p>",
			implications: "<p></p>",
			future: "<p></p>",
		};
	} else if (kind === "projectclosure") {
		params = {
			kind: "projectclosure",
			project: project_id,
			intended_outcome: "<p></p>",
			reason: "<p></p>",
			scientific_outputs: "<p></p>",
			knowledge_transfer: "<p></p>",
			data_location: "<p></p>",
			hardcopy_location: "<p></p>",
			backup_location: "<p></p>",
		};
	}

	return instance
		.post(url, params, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((res) => res.data);
	// }
};

export const getUserFeedback = async () => {
	const res = instance.get(`tasks/feedback`).then((res) => {
		return res.data;
	});
	return res;
};

export interface IUpdateFeedbackStatus {
	pk: number;
	status: string;
}

export const updateUserFeedbackStatus = async ({
	pk,
	status,
}: IUpdateFeedbackStatus) => {
	const res = instance
		.put(`tasks/feedback/${pk}`, { status: status })
		.then((res) => {
			return res.data;
		});
	return res;
};

// TASKS =====================================================================================

export const getMyTasks = async () => {
	const res = instance.get(`tasks/mine`).then((res) => {
		return res.data;
	});
	return res;
};

interface ITaskCompletionVariables {
	pk: number;
}

export const createPersonalTask = async ({
	user,
	name,
	description,
}: IQuickTask) => {
	const creator = user;

	const res = instance
		.post("tasks/", {
			user: user,
			creator: creator,
			name: name,
			description: description,
			status: "todo",
			task_type: "personal",
		})
		.then((res) => {
			return res.data;
		});
	return res;
};

export const createCommentReaction = ({
	reaction,
	comment,
	user,
}: ICommentReaction) => {
	// console.log({ reaction, comment, user })
	// return "hi"
	const res = instance
		.post("communications/reactions", {
			user: user,
			comment: comment,
			reaction: reaction,
			direct_message: null,
		})
		.then((res) => {
			return res;
		});
	return res;
};

export const createFeedbackItem = async ({
	user,
	text,
	kind,
	status,
}: IFeedback) => {
	// console.log({
	//     user, text, kind, status
	// })
	const res = instance
		.post("tasks/feedback", {
			user: user,
			text: text,
			kind: kind,
			status: status,
		})
		.then((res) => {
			return res.data;
		});
	return res;
};

export const deletePersonalTask = async ({ pk }: ITaskCompletionVariables) => {
	const res = await instance.delete(`tasks/${pk}`);
	return res.data;
};

export const completeTask = async ({ pk }: ITaskCompletionVariables) => {
	return instance
		.put(`tasks/${pk}`, { status: "done" })
		.then((res) => res.data);
};

// DOWNLOADS =====================================================================================

export const downloadProjectsCSV = () => {
	return instance
		.get(`projects/download`, {
			responseType: "blob",
		})
		.then((res) => res.data);
};

export const downloadReportPDF = ({ userID }: IUserAuthCheckVariables) => {
	return instance.post(`reports/download`, { userID }).then((res) => {
		return res.data;
	});
};

//  =========================================================== ADMIN CRUD ===========================================================

//  ADDRESSES ===========================================================

export const getAllAddresses = async () => {
	const res = instance.get(`contacts/addresses`).then((res) => {
		return res.data;
	});
	return res;
};

export const createAddress = async (formData: IAddress) => {
	return instance.post("contacts/addresses", formData).then((res) => {
		return res.data;
	});
};

export const updateAddress = async (formData: IAddress) => {
	return instance
		.put(`contacts/addresses/${formData.pk}`, formData)
		.then((res) => {
			return res.data;
		});
};

export const deleteAddress = async (pk: number) => {
	return instance.delete(`contacts/addresses/${pk}`).then((res) => {
		return res.data;
	});
};

// REPORTS ==========================================================================

export const getAvailableReportYearsForProgressReport = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;

	try {
		// console.log(pk)
		const response = await instance.get(
			`documents/reports/availableyears/${pk}/progressreport`
		);
		// console.log(response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching years:", error);
		throw error;
	}
};

export const getAvailableReportYearsForStudentReport = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;

	try {
		const response = await instance.get(
			`documents/reports/availableyears/${pk}/studentreport`
		);
		// console.log(response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching years:", error);
		throw error;
	}
};

export const getLatestReportingYear = async () => {
	try {
		const response = await instance.get("documents/reports/latestyear");
		return response.data;
	} catch (error) {
		console.error("Error fetching latest year:", error);
		throw error;
	}
};

export const getCompletedReports = async () => {
	try {
		const response = await instance.get("documents/reports/completed");
		return response.data;
	} catch (error) {
		console.error("Error fetching completed reports:", error);
		throw error;
	}
};

export const getAllReports = async () => {
	const res = instance.get(`documents/reports`).then((res) => {
		return res.data;
	});
	return res;
};

export const getReportPDFs = async () => {
	const res = instance.get(`medias/report_pdfs`).then((res) => {
		return res.data;
	});
	return res;
};

export const getReportMedia = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	// if (pk !== 0)
	// {
	const res = instance.get(`medias/report_medias/${pk}/media`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export const getAnnualReportPDF = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance.get(`documents/reports/pdf/${pk}`).then((res) => {
		return res.data;
	});
	return res;
};

export const getLatestReportMedia = async () => {
	const res = instance
		.get(`medias/report_medias/latest/media`)
		.then((res) => {
			// console.log(res.data)
			return res.data;
		});
	return res;
};

interface IReportMediaUploadProps {
	pk: number;
	file: File;
	section:
		| "cover"
		| "rear_cover"
		| "sdchart"
		| "service_delivery"
		| "research"
		| "partnerships"
		| "collaborations"
		| "student_projects"
		| "publications";
}

export const uploadReportMediaImage = async ({
	pk,
	file,
	section,
}: IReportMediaUploadProps) => {
	// console.log({ pk, file, section });

	const newFormData = new FormData();

	// if (pk !== undefined) {
	//     newFormData.append('pk', pk.toString());
	// }
	if (section !== undefined) {
		newFormData.append("section", section);
	}
	if (file !== null) {
		// console.log(file)
		if (file instanceof File) {
			// console.log('is file')
			newFormData.append("file", file);
		} else if (typeof file === "string") {
			// console.log('is string')
			newFormData.append("file", file);
		}
	}

	const res = instance
		.post(`medias/report_medias/${pk}/media`, newFormData)
		.then((res) => res);
	return res;
	// return true;
};

interface IReportMediaDeleteProps {
	pk: number;
	section:
		| "cover"
		| "rear_cover"
		| "sdchart"
		| "service_delivery"
		| "research"
		| "partnerships"
		| "collaborations"
		| "student_projects"
		| "publications";
}

export const deleteReportMediaImage = async ({
	pk,
	section,
}: IReportMediaDeleteProps) => {
	// console.log({ pk, section });

	const newFormData = new FormData();
	if (section !== undefined) {
		newFormData.append("section", section);
	}
	const res = instance
		.delete(`medias/report_medias/${pk}/media/${section}`)
		.then((res) => res);

	// const res = instance.delete(`medias/report_medias/${pk}/media`, newFormData).then((res) => res);
	return res;
};

export const getFullReport = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	// if (pk !== 0)
	// {
	const res = instance.get(`documents/reports/${pk}`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export const getFullLatestReport = async () => {
	// if (pk !== 0)
	// {
	const res = instance.get(`documents/reports/latest`).then((res) => {
		// console.log(res.data)
		return res.data;
	});
	return res;
};

export const createReport = async (formData: IReportCreation) => {
	const { year, ...otherData } = formData;

	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const generateDates = (year: number) => {
		const startDate = new Date(year - 1, 6, 1); // July 1st of the prior year
		const endDate = new Date(year, 5, 30); // June 30th of the current year
		return [formatDate(startDate), formatDate(endDate)];
	};

	const [formattedDateOpen, formattedDateClosed] = generateDates(year);

	// Include the year in the data
	const dataToSend = {
		year,
		date_open: formattedDateOpen,
		date_closed: formattedDateClosed,
		...otherData,
	};

	return instance.post("documents/reports", dataToSend).then((res) => {
		return res.data;
	});
};

export const updateReportMedia = async (formData: IReport) => {
	// console.log(formData);
	return {
		status: 200,
		message: "ok",
	};
};

export const updateReport = async (formData: IReport) => {
	const { date_open, date_closed, ...otherData } = formData;

	const formatDate = (date) => {
		if (typeof date === "string") {
			date = new Date(date); // Parse the string into a Date object
		}
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const formattedDateOpen = formatDate(date_open);
	const formattedDateClosed = formatDate(date_closed);

	const dataToSend = {
		date_open: formattedDateOpen,
		date_closed: formattedDateClosed,
		...otherData,
	};

	return instance
		.put(`documents/reports/${formData.pk}`, dataToSend)
		.then((res) => {
			return res.data;
		});
};

export const deleteReport = async (pk: number) => {
	return instance.delete(`documents/reports/${pk}`).then((res) => {
		return res.data;
	});
};

// BRANCHES ==========================================================================

export const getBranchByPk = async ({ queryKey }: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance.get(`agencies/branches/${pk}`).then((res) => res.data);
	return res;
};

export const getAllBranches = async () => {
	const res = instance.get(`agencies/branches`).then((res) => {
		return res.data;
	});
	return res;
};

export const getBranchesBasedOnSearchTerm = async (
	searchTerm: string,
	page: number
) => {
	try {
		let url = `agencies/branches?page=${page}`;

		if (searchTerm !== "") {
			url += `&searchTerm=${searchTerm}`;
		}

		const response = await instance.get(url);

		const { branches, total_results, total_pages } = response.data;
		return { branches, total_results, total_pages };
	} catch (error) {
		console.error("Error fetching branches based on search term:", error);
		throw error;
	}
};

export const createBranch = async (formData: IBranch) => {
	return instance.post("agencies/branches", formData).then((res) => {
		return res.data;
	});
};

export const updateBranch = async (formData: IBranch) => {
	return instance
		.put(`agencies/branches/${formData.pk}`, formData)
		.then((res) => {
			return res.data;
		});
};

export const deleteBranch = async (pk: number) => {
	return instance.delete(`agencies/branches/${pk}`).then((res) => {
		return res.data;
	});
};

// ADMIN

export const getMaintainer = async () => {
	const res = instance.get(`adminoptions/maintainer`).then((res) => res.data);
	return res;
};

export const getAdminOptionsByPk = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	// adminoptions
	const res = instance.get(`adminoptions/${pk}`).then((res) => res.data);
	return res;
};

export const updateAdminOptions = async (formData: IAdminOptions) => {
	return instance.put(`adminoptions/${formData.pk}`, formData).then((res) => {
		return res.data;
	});
};

// AFFILIATIONS ============================================================================

export const getAffiliationByPk = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;
	const res = instance
		.get(`agencies/affiliations/${pk}`)
		.then((res) => res.data);
	return res;
};

export const getAllAffiliations = async () => {
	const res = instance.get(`agencies/affiliations`).then((res) => {
		return res.data;
	});
	return res;
};

export const getAffiliationsBasedOnSearchTerm = async (
	searchTerm: string,
	page: number
) => {
	try {
		let url = `agencies/affiliations?page=${page}`;

		if (searchTerm !== "") {
			url += `&searchTerm=${searchTerm}`;
		}

		const response = await instance.get(url);

		const { affiliations, total_results, total_pages } = response.data;
		return { affiliations, total_results, total_pages };
	} catch (error) {
		console.error(
			"Error fetching affiliations based on search term:",
			error
		);
		throw error;
	}
};

export const createAffiliation = async (formData: IAffiliation) => {
	// console.log(formData);
	return instance.post("agencies/affiliations", formData).then((res) => {
		return res.data;
	});
};

export const mergeAffiliations = async (formData: IMergeAffiliation) => {
	// console.log(formData)
	return instance
		.post("agencies/affiliations/merge", formData)
		.then((res) => res.data);
};

export const updateAffiliation = async (formData: IAffiliation) => {
	return instance
		.put(`agencies/affiliations/${formData.pk}`, formData)
		.then((res) => {
			return res.data;
		});
};

export const deleteAffiliation = async (pk: number) => {
	return instance.delete(`agencies/affiliations/${pk}`).then((res) => {
		return res.data;
	});
};

// BUSINESS AREAS ==========================================================================

// export const getBusinessAreas = async () => {
//     try {
//         const url = `agencies/business_areas`;
//         const response = await instance.get(url);

//         return response.data;
//     } catch (error) {
//         console.error("Error fetching projects based on search term:", error);
//         throw error;
//     }
// }

export const getAllBusinessAreas = async () => {
	const res = instance.get(`agencies/business_areas`).then((res) => {
		return res.data;
	});
	return res;
};

export const getMyBusinessAreas = async () => {
	const res = instance.get(`agencies/business_areas/mine`).then((res) => {
		return res.data;
	});
	return res;
};

export const getSingleBusinessArea = async ({
	queryKey,
}: QueryFunctionContext) => {
	const [_, pk] = queryKey;

	const res = instance.get(`agencies/business_areas/${pk}`).then((res) => {
		return res.data;
	});
	return res;
};

export const createBusinessArea = async (formData: IBusinessAreaCreate) => {
	const newFormData = new FormData();

	if (formData.division !== undefined) {
		newFormData.append("division", formData.division.toString());
	}

	if (formData.old_id !== undefined) {
		newFormData.append("old_id", formData.old_id.toString());
	}
	if (formData.name !== undefined) {
		newFormData.append("name", formData.name);
	}
	// if (formData.slug !== undefined) {
	//     newFormData.append('slug', formData.slug);
	// }
	if (formData.agency !== undefined) {
		newFormData.append("agency", formData.agency.toString());
	}
	if (formData.focus !== undefined) {
		newFormData.append("focus", formData.focus);
	}
	if (formData.introduction !== undefined) {
		newFormData.append("introduction", formData.introduction);
	}
	if (formData.data_custodian !== undefined) {
		newFormData.append(
			"data_custodian",
			formData.data_custodian.toString()
		);
	}
	if (formData.finance_admin !== undefined) {
		newFormData.append("finance_admin", formData.finance_admin.toString());
	}
	if (formData.leader !== undefined) {
		newFormData.append("leader", formData.leader.toString());
	}

	if (formData.image !== null) {
		if (formData.image instanceof File) {
			newFormData.append("image", formData.image);
		} else if (typeof formData.image === "string") {
			newFormData.append("image", formData.image);
		}
	}

	// console.log(newFormData);

	return instance.post("agencies/business_areas", newFormData).then((res) => {
		return res.data;
	});
};

export interface BusinessAreaUpdateProps {
	agency?: number;
	old_id?: number;
	pk?: number;
	division?: number;
	slug: string;
	name: string;
	focus: string;
	introduction: string;
	image: BusinessAreaImage | File;
	leader: number;
	finance_admin: number;
	data_custodian: number;
	selectedImageUrl: string | null;
}

export const updateBusinessArea = async (formData: BusinessAreaUpdateProps) => {
	// console.log(formData)

	const newFormData = new FormData();

	if (formData.division !== undefined) {
		newFormData.append("division", formData.division.toString());
	}

	if (formData.old_id !== undefined) {
		newFormData.append("old_id", formData.old_id.toString());
	}
	if (formData.name !== undefined) {
		newFormData.append("name", formData.name);
	}
	if (formData.slug !== undefined) {
		newFormData.append("slug", formData.slug);
	}
	if (formData.agency !== undefined) {
		newFormData.append("agency", formData.agency.toString());
	}
	if (formData.focus !== undefined) {
		newFormData.append("focus", formData.focus);
	}
	if (formData.introduction !== undefined) {
		newFormData.append("introduction", formData.introduction);
	}
	if (formData.data_custodian !== undefined) {
		newFormData.append(
			"data_custodian",
			formData.data_custodian.toString()
		);
	}
	if (formData.finance_admin !== undefined) {
		newFormData.append("finance_admin", formData.finance_admin.toString());
	}
	if (formData.leader !== undefined) {
		newFormData.append("leader", formData.leader.toString());
	}

	if (formData.image !== null) {
		// console.log(formData.image)
		if (formData.image instanceof File) {
			// console.log('is file')
			newFormData.append("image", formData.image);
		} else if (typeof formData.image === "string") {
			// console.log('is string')
			newFormData.append("image", formData.image);
		}
	} else {
		if (formData.selectedImageUrl === null) {
			newFormData.append("selectedImageUrl", "delete");
		}
	}

	// console.log(newFormData);

	return instance
		.put(`agencies/business_areas/${formData.pk}`, newFormData)
		.then((res) => {
			return res.data;
		});
};

export const deleteBusinessArea = async (pk: number) => {
	return instance.delete(`agencies/business_areas/${pk}`).then((res) => {
		return res.data;
	});
};

export const activateBusinessArea = async (pk: number) => {
	return instance
		.post(`agencies/business_areas/setactive/${pk}`)
		.then((res) => {
			return res.data;
		});
};

// DIVISIONS ==========================================================================

export const getAllDivisions = async () => {
	const res = instance.get(`agencies/divisions`).then((res) => {
		return res.data;
	});
	return res;
};

export const createDivision = async (formData: IDivision) => {
	return instance.post("agencies/divisions", formData).then((res) => {
		return res.data;
	});
};

export const updateDivision = async (formData: IDivision) => {
	return instance
		.put(`agencies/divisions/${formData.pk}`, formData)
		.then((res) => {
			return res.data;
		});
};

export const deleteDivision = async (pk: number) => {
	return instance.delete(`agencies/divisions/${pk}`).then((res) => {
		return res.data;
	});
};

// LOCATIONS =====================================================================================

export const getAllLocations = async () => {
	try {
		const res = await instance.get(`locations`);

		const locationsData = res.data;

		// Organize locations based on their 'area_type'
		const organizedLocations: OrganisedLocationData = {
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		};

		// Loop through the locations and add them to the corresponding area_type array
		locationsData.forEach((location: ISimpleLocationData) => {
			const areaType = location.area_type;
			if (areaType in organizedLocations) {
				organizedLocations[areaType].push(location);
			}
		});

		// Sort each array alphabetically based on the 'name' property of each location
		for (const areaType in organizedLocations) {
			organizedLocations[areaType].sort((a, b) => {
				const nameA = a.name.toUpperCase();
				const nameB = b.name.toUpperCase();
				if (nameA.startsWith("ALL ") && !nameB.startsWith("ALL ")) {
					return -1;
				} else if (
					!nameA.startsWith("ALL ") &&
					nameB.startsWith("ALL ")
				) {
					return 1;
				} else {
					return nameA.localeCompare(nameB);
				}
			});
		}

		return organizedLocations;
	} catch (error) {
		// console.log("Error with Locations")

		return {
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		};
	}
};

export const createLocation = async (formData: IAddLocationForm) => {
	formData.old_id = 1;
	return instance.post("locations/", formData).then((res) => {
		return res.data;
	});
};

export const updateLocation = async (formData: IAddLocationForm) => {
	return instance.put(`locations/${formData.pk}`, formData).then((res) => {
		return res.data;
	});
};

export const deleteLocation = async (pk: number) => {
	return instance.delete(`locations/${pk}`).then((res) => {
		return res.data;
	});
};

// SERVICES ==========================================================================

export const getAllDepartmentalServices = async () => {
	try {
		const url = `agencies/services`;
		const response = await instance.get(url);
		return response.data;
	} catch (error) {
		console.error("Error fetching projects based on search term:", error);
		throw error;
	}
};

export const createDepartmentalService = async (
	formData: IDepartmentalService
) => {
	return instance.post("agencies/services", formData).then((res) => {
		return res.data;
	});
};

export const updateDepartmentalService = async (
	formData: IDepartmentalService
) => {
	return instance
		.put(`agencies/services/${formData.pk}`, formData)
		.then((res) => {
			return res.data;
		});
};

export const deleteDepartmentalService = async (pk: number) => {
	return instance.delete(`agencies/services/${pk}`).then((res) => {
		return res.data;
	});
};

// EMAILS ==========================================================================

export interface IDocumentApproved {
	recipients_list: number[]; // array of pks
	project_pk: number;
	document_kind?: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentApprovedEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
}: IDocumentApproved) => {
	return instance
		.post(`documents/document_approved_email`, {
			recipients_list: recipients_list,
			project_pk: project_pk,
			document_kind: document_kind,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IFeedbackReceived {
	recipients_list: number[]; // array of pks
}

export const sendFeedbackReceivedEmail = async ({
	recipients_list,
}: IFeedbackReceived) => {
	return instance
		.post(`documents/feedback_received_email`, {
			recipients_list: recipients_list,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IDocumentRecalled {
	stage: number;

	recipients_list: number[]; // array of pks
	project_pk: number;
	document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentRecalledEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
	stage,
}: IDocumentRecalled) => {
	return instance
		.post(`documents/document_recalled_email`, {
			stage: stage,
			recipients_list: recipients_list,
			project_pk: project_pk,
			document_kind: document_kind,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IReviewDocumentEmail {
	recipients_list: number[]; // array of pks
	project_pk: number;
	document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosure
}

export const sendReviewProjectDocumentEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
}: IReviewDocumentEmail) => {
	return instance
		.post(`documents/review_document_email`, {
			recipients_list: recipients_list,
			project_pk: project_pk,
			document_kind: document_kind,
		})
		.then((res) => {
			return res.data;
		});
};

export interface INewCycleEmail {
	financial_year: number;
	include_projects_with_status_updating?: boolean;
}

export const sendNewReportingCycleOpenEmail = async ({
	financial_year,
	include_projects_with_status_updating,
}) => {
	return instance
		.post(`documents/new_cycle_email`, {
			financial_year: financial_year,
			include_projects_with_status_updating:
				include_projects_with_status_updating,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IProjectClosureEmail {
	project_pk: number;
}

export const sendProjectClosureEmail = async ({
	project_pk,
}: IProjectClosureEmail) => {
	return instance
		.post(`documents/project_closure_email`, {
			project_pk: project_pk,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IDocumentReadyEmail {
	recipients_list: number[]; // array of pks
	project_pk: number;
	document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentReadyEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
}: IDocumentReadyEmail) => {
	return instance
		.post(`documents/document_ready_email`, {
			recipients_list: recipients_list,
			project_pk: project_pk,
			document_kind: document_kind,
		})
		.then((res) => {
			return res.data;
		});
};

export interface IDocumentSentBack {
	stage: number;
	recipients_list: number[]; // array of pks
	project_pk: number;
	document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentSentBackEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
	stage,
}: IDocumentSentBack) => {
	return instance
		.post(
			`documents/document_sent_back_email`,

			{
				stage: stage,
				recipients_list: recipients_list,
				project_pk: project_pk,
				document_kind: document_kind,
			}
		)
		.then((res) => {
			return res.data;
		});
};

export const sendConceptPlanEmail = async ({
	recipients_list,
	project_pk,
	document_kind,
}: IDocumentApproved) => {
	return instance
		.post(`documents/concept_plan_email`, {
			recipients_list: recipients_list,
			project_pk: project_pk,
			document_kind: document_kind,
		})
		.then((res) => {
			return res.data;
		});
};

// export const celeryStartTask = async () => {
//     return instance.post(
//         'documents/celery_start',
//     ).then(res => res.data);
// }

// export const celeryStopTask = async () => {
//     return instance.post(
//         'documents/celery_stop',
//     ).then(res => res.data);
// }

export const getLatestActiveStudentReports = async () => {
	return instance
		.get(`documents/latest_active_student_reports`)
		.then((res) => res.data);
};

export const getLatestActiveProgressReports = async () => {
	return instance
		.get(`documents/latest_active_progress_reports`)
		.then((res) => res.data);
};

export const getLatestUnapprovedReports = async () => {
	return instance
		.get(`documents/latest_inactive_reports`)
		.then((res) => res.data);
};

export interface ISaveStudentReport {
	mainDocumentId: number;
	progressReportHtml: string;
}

export const updateStudentReportProgress = async ({
	mainDocumentId,
	progressReportHtml,
}: ISaveStudentReport) => {
	return instance.post(`documents/student_reports/update_progress`, {
		main_document_pk: mainDocumentId,
		html: progressReportHtml,
	});
};

export interface ISaveProgressReportSection {
	section: "context" | "aims" | "progress" | "implications" | "future";
	mainDocumentId: number;
	htmlData: string;
}

export const updateProgressReportSection = async ({
	mainDocumentId,
	htmlData,
	section,
}: ISaveProgressReportSection) => {
	return instance.post(`documents/progress_reports/update`, {
		section: section,
		main_document_pk: mainDocumentId,
		html: htmlData,
	});
};

export interface IGeneratePDFProps {
	reportId: number;
	section: string;
	businessArea?: number;
}

export const generateReportPDF = async ({
	reportId,
	section,
	businessArea,
}: IGeneratePDFProps) => {
	const options = {
		section: section,
		business_area: businessArea,
	};

	return instance.post(`documents/reports/${reportId}/generate_pdf`, options);
};

// interface IPdfCreation {
//     component: React.ReactElement; // collection of html strings to be embedded within the pdf with html to pdf
// }

// export const createPDFWithHTMLToPDF = async ({ component }: IPdfCreation): void => {
//     ReactPDF.render(component, `${__dirname}/test.pdf`);

//     try {
//         const pdfBlob = await ReactPDF.renderToFile(component);

//         // Create a download link for the user
//         const downloadLink = document.createElement('a');
//         downloadLink.href = URL.createObjectURL(pdfBlob);
//         downloadLink.download = 'generated_pdf.pdf';
//         downloadLink.click();
//       } catch (error) {
//         console.error('Error creating PDF:', error);
//       }

// };

export const testFunction = async () => {
	return {
		ok: true,
	};
	// return instance.post(
	//     `documents/concept_plan_email`,
	//     {
	//         "recipients_list": [101073],
	//         "project_pk": 4,
	//         "document_kind": "concept",
	//     }
	// ).then(res => {
	//     return res.data;
	// }
	// );
};

// PDF GENERATION ==========================================================================

export interface IConceptGenerationProps {
	concept_plan_pk: number;
	renderedHtmlString?: string;
}

export const getDataForConceptPlanGeneration = async (
	concept_plan_pk: number
): Promise<IConceptPlanGenerationData> => {
	return instance
		.post(
			`documents/conceptplans/${concept_plan_pk}/get_concept_plan_data`,
			{
				concept_plan_pk: concept_plan_pk,
			}
		)
		.then((res) => {
			return res.data;
		});
};

export interface IDocGen {
	document_pk: number;
}

// export const generateConceptPlan = async ({ document_pk }: IDocGen) => {
//     const res = await instance.post(
//         `documents/generate_concept_plan/${document_pk}`,
//     );
//     console.log(res.data);
//     return { res };
// }

// import fs from 'fs/promises'

// async function updateCSS() {
//     try {
//         // Read the content of "@/styles/texteditor.css"
//         const cssFilePath = './src/styles/texteditor.css';
//         const newCSSContent = await fs.readFile(cssFilePath, 'utf-8');

//         // Write the content to the public folder
//         const publicCSSFilePath = './public/texteditor.css';
//         await fs.writeFile(publicCSSFilePath, newCSSContent, 'utf-8');

//         console.log('CSS file updated successfully.');
//     } catch (error) {
//         console.error('Error updating CSS file:', error.message);
//     }
// }

export const generateProjectDocument = async ({ document_pk }: IDocGen) => {
	// Use import.meta.url directly to get the base URL
	const cssFileURL = "/texteditor.css";

	// Import the CSS file using Vite's import function
	const cssFileContents = await fetch(cssFileURL)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to fetch ${cssFileURL}`);
			}
			return response.text();
		})
		.then((cssFileContent) => {
			// console.log({ cssFileURL, cssFileContent });
			// Send the object as JSON
			const css_content = JSON.stringify(cssFileContent);
			// You can send jsonString to your server using an HTTP request (e.g., fetch or axios)
			// console.log(css_content); // Log the JSON string for verification
			return css_content;
		});

	const res = await instance.post(
		`documents/generate_project_document/${document_pk}`,
		{ css_content: cssFileContents }
	);
	// console.log(res.data);
	return { res };
};

export const generateAnnualReportPDF = async ({ document_pk }: IDocGen) => {
	// Use import.meta.url directly to get the base URL
	const cssFileURL = "/texteditor.css";

	// Import the CSS file using Vite's import function
	const cssFileContents = await fetch(cssFileURL)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to fetch ${cssFileURL}`);
			}
			return response.text();
		})
		.then((cssFileContent) => {
			// console.log({ cssFileURL, cssFileContent });
			// Send the object as JSON
			const css_content = JSON.stringify(cssFileContent);
			// You can send jsonString to your server using an HTTP request (e.g., fetch or axios)
			// console.log(css_content); // Log the JSON string for verification
			return css_content;
		});

	const res = await instance.post(
		`documents/reports/${document_pk}/generate_pdf`,
		{ css_content: cssFileContents }
	);
	// console.log(res.data);
	return { res };
};

export const cancelProjectDocumentGeneration = async ({
	document_pk,
}: IDocGen) => {
	const res = await instance.post(`documents/cancel_doc_gen/${document_pk}`);
	// console.log(res.data);
	return { res };
};

export const cancelAnnualReportPDF = async ({ document_pk }: IDocGen) => {
	const res = await instance.post(
		`documents/reports/${document_pk}/cancel_doc_gen`
	);
	// console.log(res.data);
	return { res };
};
