import axios, { AxiosHeaders } from "axios";
import Cookie from 'js-cookie';
import { QueryFunctionContext } from "@tanstack/react-query";
import { EditorSubsections, EditorType, IAddLocationForm, IAddress, IApproveProgressReport, IBranch, IBusinessArea, IDepartmentalService, IDivision, IPersonalInformation, IProfile, IProjectMember, IQuickTask, IReport, IResearchFunction, ISearchTerm, ISimpleLocationData, OrganisedLocationData, ProgressReportSection, ProjectClosureSection, ProjectPlanSection, ProjectSection, StudentReportSection } from "../types";

// INSTANCE SETUP ==================================================================

const instance = axios.create({
    baseURL:
        // process.env.NODE_ENV === "development" ?
        "http://127.0.0.1:8000/api/v1/"
    // "http://127.0.0.1/api/v1/"
    // This is for nginx
    //  :
    // "PRODUCTION URL GOES HERE"
    ,
    withCredentials: true,
})

// Intercept and inject csrf every request (up to date and dynamic)
instance.interceptors.request.use(config => {
    const csrfToken = Cookie.get("csrftoken") || "";
    config.headers["X-CSRFToken"] = csrfToken;
    return config;
});





// AUTHENTICATION ==============================================================

export const getSSOMe = () => {
    instance.get(`users/me`).then((response) => response.data);
}


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
}: IUsernameLoginVariables): Promise<IUsernameLoginSuccess> =>
    instance.post(`users/log-in`, { username, password })
        .then((response) => {
            if (response.data.ok) {
                return response.data;
            } else {
                throw new Error('Please check your credentials and try again.');
            }
        })
        .catch((error) => {
            throw error;
        });

export const logOut = () =>
    instance
        .post(`users/log-out`, null,)
        .then((response) => {
            if (response.data.ok) {
                return response.data;
            } else {
                throw new Error('Error logging out.', response.data.error);
            }
        }).catch((e) => {
            throw e;
        });


// USER CREATION ==============================================================

export const getDoesUserWithEmailExist = async (email: string) => {
    try {
        const response = await instance.post(
            'users/check-email-exists',
            { email },
        );
        const { exists } = response.data;
        console.log(exists ? 'User exists' : 'User does not exist');
        return exists;
    } catch (error) {
        console.error('Error checking user by email:', error);
        throw error;
    }
};

interface NameData {
    firstName: string;
    lastName: string;
}

export const getDoesUserWithFullNameExist = async ({ firstName, lastName }: NameData) => {
    try {
        const response = await instance.post(
            'users/check-name-exists',
            { first_name: firstName, last_name: lastName },
        );
        const { exists } = response.data;
        return exists;
    } catch (error) {
        console.error('Error checking user by full name:', error);
        throw error;
    }
};


interface UserData {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}

export const createUser = async (userData: UserData) => {
    try {
        const response = await instance.post("users/", userData,
        );
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
}

// DASHBOARD ==========================================================

export const getQuote = async () => {
    return instance.get(`quotes/random/`).then(res => res.data)
}


export const getMyProjects = async () => {
    const res = instance.get(`projects/mine`).then(res => {
        return res.data
    })
    return res;
}



export const getMyPartnerships = async () => {
    const res = instance.get(`partnerships/mine`
    ).then(res => {
        return res.data
    }
    )
    return res;
}

// USERS ======================================================


export interface AdminSwitchVar {
    userPk: number | string;
}

export const switchAdmin = async ({ userPk }: AdminSwitchVar) => {
    const res = instance.post(`users/${userPk}/admin`).then(res => { return res.data })
    return res;
}

export const deleteUserAdmin = async ({ userPk }: AdminSwitchVar) => {
    const res = instance.delete(`users/${userPk}`).then(res => { return res.data })
    return res;
}


export const getMe = async () => {
    const res = instance.get(`users/me`).then(res => {
        return res.data
    })
    return res;
}

interface IFullUserProps {
    pk: string;
}

export const getFullUser = async ({ queryKey }: QueryFunctionContext) => {
    const [_, pk] = queryKey;
    // if (pk !== 0)
    // {
    const res = instance.get(`users/${pk}`).then(res => {
        // console.log(res.data)
        return res.data
    })
    return res;

    // }
    // else {
    //     return {

    //     }
    // }
}




export const getSingleUser = async ({ queryKey }: QueryFunctionContext) => {
    const [_, userPk] = queryKey;
    return instance.get(
        `users/${userPk}`,).then(res => {
            console.log(res.data);
            return res.data;
        })
}


export const getUsersBasedOnSearchTerm = async (searchTerm: string, page: number, filters: any) => {
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

        const response = await instance.get(url);

        const { users, total_results, total_pages } = response.data;
        return { users, total_results, total_pages };
    } catch (error) {
        console.error("Error fetching users based on search term:", error);
        throw error;
    }
};


export const getInternalUsersBasedOnSearchTerm = async (searchTerm: string, onlyInternal: boolean) => {
    try {
        let url = `users/smallsearch`;

        if (searchTerm !== "") {
            url += `?searchTerm=${searchTerm}`;
        }

        url += `&onlyInternal=${(onlyInternal === undefined || onlyInternal == false) ? "False" : "True"}`

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
    }
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




export const getPersonalInformation = ({ queryKey }: QueryFunctionContext): Promise<IPersonalInformation> => {
    const [_, userId] = queryKey;
    return instance
        .get(`users/${userId}/pi`).then(res => res.data);
}

export const getProfile = ({ queryKey }: QueryFunctionContext): Promise<IProfile> => {
    const [_, userId] = queryKey;
    console.log(userId)
    return instance
        .get(`users/${userId}/profile`).then(res => res.data);
}


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

}

export const adminUpdateUser = async ({ userPk, title, phone, fax, branch, business_area, image, about, expertise }: IFullUserUpdateVariables) => {
    console.log(
        userPk, title, phone, fax, branch, business_area, image, about, expertise
    )

    try {
        console.log(branch)
        console.log(business_area)

        const membershipData = {
            userPk: userPk,
            branch: (branch !== null && branch !== '') ? Number(branch) : 0,
            business_area: (business_area !== null && branch !== '') ? Number(business_area) : 0,
        };
        await updateMembership(membershipData);

        const profileData = {
            userPk: userPk.toString(),
            image: image !== undefined && image !== null ? image : '',
            about: about !== undefined && about !== '' ? about : '',
            expertise: expertise !== undefined && expertise !== '' ? expertise : '',
        };
        await updateProfile(profileData);

        const piData = {
            userPk: userPk.toString(),
            title: title !== undefined && title !== '' ? title : '',
            phone: phone !== undefined && phone !== '' ? phone : '',
            fax: fax !== undefined && fax !== '' ? fax : '',
        };
        await updatePersonalInformation(piData);


        return { ok: "Update successful" };
    } catch (error: any) {
        throw new Error(error.message || 'An unknown error occurred');
    }
}

export interface IMembershipUpdateVariables {
    userPk: string | number;
    branch: number;
    business_area: number;
}

export const updateMembership = async ({ userPk, branch, business_area }: IMembershipUpdateVariables) => {
    console.log(userPk, branch, business_area)
    const response = await instance.put(
        `users/${userPk}/membership`, {
        user_pk: userPk,
        branch_pk: branch,
        business_area: business_area,
    }
    )
    return response.data
}



export const updatePersonalInformation = async ({ userPk, title, phone, fax }: IPIUpdateVariables) => {
    console.log(
        userPk, title, phone, fax
    )
    return instance.put(
        `users/${userPk}/pi`,
        { title, phone, fax }).then(res => res.data);

}


// export const updateTeamMemberPosition = async (user_id: number, project_id: number, newPosition: number) => {
//     const data = {
//         user_id: user_id,
//         new_position: newPosition,
//     };

//     const response = await instance.put(`projects/${project_id}/team`, data);
//     return response.data; // Assuming your backend returns updated data
// };

export const updateProfile = async ({ userPk, image, about, expertise }: IProfileUpdateVariables) => {

    console.log(
        userPk, image, about, expertise
    )

    const formData = new FormData();
    formData.append('userPk', userPk);

    if (about !== undefined) {
        formData.append('about', about);
    }

    if (expertise !== undefined) {
        formData.append('expertise', expertise);
    }

    if (image !== null) {
        if (image instanceof File) {
            formData.append('image', image);
        } else if (typeof image === 'string') {
            formData.append('image', image);
        }

    }

    console.log(formData);

    const response = await instance.put(`users/${userPk}/profile`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data; // Assuming your response structure is similar to IProfileUpdateSuccess


}


// return instance.put(
//     `users/${userPk}/profile`,
//     { image, about, expertise }).then(res => res.data);


// PROJECTS ==========================================================================


export const getFullProject = async ({ queryKey }: QueryFunctionContext) => {
    const [_, pk] = queryKey;
    const res = instance.get(`projects/${pk}`).then(res => {
        console.log(res.data)
        return res.data
    })
    return res;
}

export const getFullProjectSimple = async (preselectedProjectPk: number) => {
    try {
        const res = await instance.get(`projects/${preselectedProjectPk}`);
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        throw error; // You can handle errors as needed
    }
};


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

export const createTeamMember = async ({ user, project, role, timeAllocation, shortCode, comments }: INewMember) => {
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
    }

    console.log(data);

    const response = await instance.post(`projects/project_members`, data);
    return response.data;
}

export type RemoveUserMutationType = {
    user: number;
    project: number;
};

export const removeTeamMemberFromProject = async (formData: RemoveUserMutationType) => {

    console.log(formData);

    const response = await instance.delete(`projects/project_members/${formData.project}/${formData.user}`);
    console.log(response.data === "");
    console.log(response.status);
    return response;

}


export const promoteUserToLeader = async (formData: RemoveUserMutationType) => {
    console.log(formData);

    const response = await instance.post(
        `projects/promote`,
        {
            "user": formData.user,
            "project": formData.project,
        }
    );

    console.log(response.data === "");
    console.log(response.status);
    return response.data;
}




export const updateTeamMemberPosition = async (project_id: number, reorderedTeam: IProjectMember[]) => {
    const data = {
        reordered_team: reorderedTeam, // Include the reorderedTeam data in the request
    };

    const response = await instance.put(`projects/${project_id}/team`, data);
    return response.data.sorted_team; // Assuming your backend returns sorted_team
};

export const getProjectTeam = async ({ queryKey }: QueryFunctionContext) => {
    const [_, pk] = queryKey;
    const res = instance.get(`projects/${pk}/team`).then(res => {
        console.log(res.data)
        return res.data
    })
    return res;
}


export const getDirectorateMembers = async ({ queryKey }: QueryFunctionContext) => {

    // GET DIRECTORATE FROM BACKEND HERE!!
    const res = instance.get(`users/directorate`).then(res => {
        console.log(res.data)
        return res.data
    })
    return res;
}





// export const setUserFTE = async () => {
//     return res
// }

// export const setUserRole = async () => {
//     return res
// }

// export const setUserPosition = async () => {
//     return res
// }


// PROJECT CREATION ==========================================================================

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
    supervisingScientist: number;
    departmentalService: number;
    researchFunction: number;
    businessArea: number;
    dates: Date[];
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
}

export const createProject = async ({ baseInformationData, detailsData, locationData, externalData, studentData }: IProjectCreationVariables) => {

    console.log(
        baseInformationData, detailsData, locationData, externalData, studentData
    )

    const formData = new FormData();
    formData.append('year', baseInformationData.year.toString());
    formData.append('kind', baseInformationData.kind);
    formData.append('creator', baseInformationData.creator.toString());
    formData.append('title', baseInformationData.title);
    formData.append('description', baseInformationData.description);
    formData.append('keywords', baseInformationData.keywords.join(', '));

    if (baseInformationData.imageData !== null) {
        if (baseInformationData.imageData instanceof File) {

            formData.append('imageData', baseInformationData.imageData);
        } else if (typeof baseInformationData.imageData === 'string') {
            formData.append('imageData', baseInformationData.imageData);

        }

    }

    formData.append('businessArea', detailsData.businessArea.toString());
    formData.append('researchFunction', detailsData.researchFunction.toString());
    formData.append('departmentalService', detailsData.departmentalService.toString());
    formData.append('dataCustodian', detailsData.dataCustodian.toString());
    formData.append('supervisingScientist', detailsData.supervisingScientist.toString());

    detailsData.dates.forEach((date, index) => {
        formData.append('dates', date.toISOString());
    });

    locationData.forEach((location, index) => {
        formData.append('locations', location.toString());
    });

    if (baseInformationData.kind === "student") {
        formData.append('organisation', studentData.organisation);
        formData.append('level', studentData.level);

    }
    else if (baseInformationData.kind === "external") {
        formData.append('externalDescription', externalData.externalDescription);
        formData.append('aims', externalData.aims);
        formData.append('budget', externalData.budget);
        formData.append('collaborationWith', externalData.collaborationWith);
    }

    console.log(formData);

    return instance.post(
        `projects/`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then(res => res.data);

}

export interface IUpdateProjectDetails {
    // departmentalService: number;
    // researchFunction: number;
    // businessArea: number;
    description: string;
    // dates: Date[];
}

export const updateProjectDetails = async ({
    description
}: IUpdateProjectDetails) => {
    return instance.get('google.com')
}

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
    searchTerm: string, userPk: number
) => {
    try {
        let url = `projects/smallsearch`;

        if (userPk !== null && userPk !== 0 && userPk !== undefined) {
            if (searchTerm !== "") {
                url += `?searchTerm=${searchTerm}`;
                url += `&userPk=${userPk}`
            }
            else {
                url += `?userPk=${userPk}`
            }
        }

        const response = await instance.get(url);

        const { projects } = response.data;
        return { projects };
    } catch (error) {
        console.error("Error fetching projects based on search term:", error);
        throw error;
    }

}


export const getProjectsBasedOnSearchTerm = async (
    searchTerm: string,
    page: number,
    filters: {
        onlyActive: boolean;
        onlyInactive: boolean;
        filterBA: string;
        filterProjectKind: string;
        filterProjectStatus: string;
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

        // console.log({
        //     "url": url,
        //     "filterBA": filters.filterBA,
        //     "projectStatus": filters.filterProjectStatus,
        //     "projectKind": filters.filterProjectKind,
        // })


        const response = await instance.get(url,);

        const { projects, total_results, total_pages } = response.data;
        // console.log(projects)
        return { projects, total_results, total_pages };
    } catch (error) {
        console.error("Error fetching projects based on search term:", error);
        throw error;
    }

}

export const getProjects = async ({ searchTerm }: ISearchTerm) => {

    return instance.post(
        "projects/", {
        searchTerm: searchTerm,
    }).then(res => {
        return res.data;
    })
}


// DOCUMENTS ==========================================================================

export interface IDocGenerationProps {
    docPk: number | string;
    kind: string;
}

export const downloadProjectDocument = async ({ docPk }: IDocGenerationProps) => {
    if (docPk === undefined) return;
    console.log(docPk);
    const pk = Number(docPk);

    const url = "documents/downloadProjectDocument"
    const params = {
        "document_id": pk
    }

    return instance.post(
        url,
        params,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then(res => res.data);
}

export const generateProjectDocument = async ({
    docPk,
    kind,
}: IDocGenerationProps) => {
    if (docPk === undefined) return;
    console.log(docPk);
    const pk = Number(docPk);
    const url = `documents/generateProjectDocument/${pk}`
    const params = {
        "kind": kind,
    }

    instance.post(
        url,
        params,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then(res => {
        console.log(res.data);
        return res.data;
    });

}


export const handleProgressReportAction = async ({ action, stage, documentPk, progressReportPk }: IApproveProgressReport) => {

    let url = ""
    if (action === "approve") {
        url = `documents/progressreports/approve`
    } else if (action === "recall") {
        url = `documents/progressreports/recall`

    } else if (action === "send_back") {
        url = `documents/progressreports/send_back`
    }
    const params = {
        "action": action,
        "stage": stage,
        "documentPk": documentPk,
        "progressReportPk": progressReportPk,
    }
    console.log(params)

    return instance.post(
        url,
        params,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then(res => res.data);
}


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



export interface IHTMLSave {
    editorType: EditorType;
    htmlData: string;

    project_pk: null | number;
    document_pk: null | number;
    section: null | EditorSubsections;
}

// Also have this handle directors message, research intro etc. (annual report)
export const saveHtmlToDB = async ({ editorType, htmlData, project_pk, document_pk, section }: IHTMLSave) => {

    if (editorType === "ProjectDocument") {
        const data = {
            "html": htmlData,
            "project": project_pk,
            "document": document_pk,
            "section": section,
        }
        console.log(data)

    }
    else if (editorType === "ProjectDetail") {
        // Null document is okay - that will be handled on the backend (as the description)
        // if document is None and section is not None, make changes to the projects title or description
        // based on section
        const data = {
            "html": htmlData,
            "project": project_pk,
            "section": section,
        }
        console.log(data)
        // GO to project endpoint
    }


}


interface ISpawnDocument {
    project_pk: number;
    kind: string;
}

export const spawnDocument = async ({ project_pk, kind }: ISpawnDocument) => {
    console.log(project_pk, kind);

    const choices = ["concept", "projectplan", "progressreport", "studentreport", "projectclosure"]
    if (!choices.includes(kind)) {
        return;
    }

    // Create the document first (as a document object)
    const url = `documents/projectdocuments`
    const params = {
        "kind": kind,
        "project": project_pk,
        "details": {},
    }


    // Create the details for the document, depending on its type
    // if (kind === "concept") {
    // params["details"] = {}
    // } 
    // else if (kind === "projectplan") {

    // } else if (kind === "progressreport") {

    // } else if (kind === "studentreport") {

    // } else if (kind === "projectclosure") {

    // } 
    // If both are successful, return the data of the details, which references the document

    // If not, find where teh issue is and return the error for that

    return instance.post(
        url,
        params,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    ).then(res => res.data);
    // }
}





// TASKS =====================================================================================


export const getMyTasks = async () => {
    const res = instance.get(`tasks/mine`).then(res => {
        return res.data
    })
    return res;
}


interface ITaskCompletionVariables {
    pk: number
}

export const createPersonalTask = async ({ user, name, description }: IQuickTask) => {
    const creator = user;

    const res = instance.post(
        "tasks/", {
        user: user,
        creator: creator,
        name: name,
        description: description,
        status: 'todo',
        task_type: 'personal'
    }).then(res => {
        return res.data
    })
    return res;
}


export const deletePersonalTask = async ({ pk }: ITaskCompletionVariables) => {
    const res = await instance.delete(`tasks/${pk}`);
    return res.data;

}


export const completeTask = async ({ pk }: ITaskCompletionVariables) => {
    return instance.put(
        `tasks/${pk}`,
        { status: "done" }).then(res => res.data);
}


// DOWNLOADS =====================================================================================

export const downloadProjectsCSV = () => {
    return instance.get(
        `projects/download`,
        {
            responseType: 'blob',
        }
    ).then((res) => {
        console.log(res);
        const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'projects.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    })
}


export const downloadReportPDF = ({
    userID
}: IUserAuthCheckVariables) => {
    return instance.post(
        `reports/download`,
        { userID },
    ).then((res) => {
        return res.data
    })
}


//  =========================================================== ADMIN CRUD ===========================================================


//  ADDRESSES ===========================================================


export const getAllAddresses = async () => {
    const res = instance.get(`contacts/addresses`
    ).then(res => {
        return res.data
    })
    return res;
}

export const createAddress = async (formData: IAddress) => {
    return instance.post(
        "contacts/addresses", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateAddress = async (formData: IAddress) => {
    return instance.put(
        `contacts/addresses/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteAddress = async (pk: number) => {
    return instance.delete(
        `contacts/addresses/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}



// REPORTS ==========================================================================

export const getLatestReportingYear = async () => {
    try {
        const response = await instance.get("documents/reports/latestyear");
        return response.data;
    } catch (error) {
        console.error("Error fetching latest year:", error);
        throw error;
    }
}


export const getCompletedReports = async () => {
    try {
        const response = await instance.get("documents/reports/completed");
        return response.data;
    } catch (error) {
        console.error("Error fetching completed reports:", error);
        throw error;
    }
}


export const getAllReports = async () => {
    const res = instance.get(`documents/reports`
    ).then(res => {
        return res.data
    })
    return res;
}

export const createReport = async (formData: IReport) => {
    return instance.post(
        "documents/reports", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateReport = async (formData: IReport) => {
    return instance.put(
        `documents/reports/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteReport = async (pk: number) => {
    return instance.delete(
        `documents/reports/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}




// BRANCHES ==========================================================================


export const getAllBranches = async () => {
    const res = instance.get(`agencies/branches`
    ).then(res => {
        return res.data
    })
    return res;
}


export const getBranchesBasedOnSearchTerm = async (searchTerm: string, page: number) => {
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
    return instance.post(
        "agencies/branches", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateBranch = async (formData: IBranch) => {
    return instance.put(
        `agencies/branches/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteBranch = async (pk: number) => {
    return instance.delete(
        `agencies/branches/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}


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
    const res = instance.get(`agencies/business_areas`
    ).then(res => {
        return res.data
    })
    return res;
}

export const getSingleBusinessArea = async ({ queryKey }: QueryFunctionContext) => {
    const [_, pk] = queryKey;

    const res = instance.get(`agencies/business_areas/${pk}`)
        .then(res => {
            return res.data
        })
    return res;
}


export const createBusinessArea = async (formData: IBusinessArea) => {
    return instance.post(
        "agencies/business_areas", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateBusinessArea = async (formData: IBusinessArea) => {
    return instance.put(
        `agencies/business_areas/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteBusinessArea = async (pk: number) => {
    return instance.delete(
        `agencies/business_areas/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}


// DIVISIONS ==========================================================================


export const getAllDivisions = async () => {
    const res = instance.get(`agencies/divisions`
    ).then(res => {
        return res.data
    })
    return res;
}

export const createDivision = async (formData: IDivision) => {
    return instance.post(
        "agencies/divisions", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateDivision = async (formData: IDivision) => {
    return instance.put(
        `agencies/divisions/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteDivision = async (pk: number) => {
    return instance.delete(
        `agencies/divisions/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}



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
                } else if (!nameA.startsWith("ALL ") && nameB.startsWith("ALL ")) {
                    return 1;
                } else {
                    return nameA.localeCompare(nameB);
                }
            });
        }



        return organizedLocations;
    } catch (error) {
        console.log("Error with Locations")

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
    return instance.post(
        "locations/", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateLocation = async (formData: IAddLocationForm) => {
    return instance.put(
        `locations/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteLocation = async (pk: number) => {
    return instance.delete(
        `locations/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}


//  RESEARCH FUNCTIONS ===========================================================


export const getAllResearchFunctions = async () => {
    const res = instance.get(`projects/research_functions`
    ).then(res => {
        return res.data
    })
    return res;
}

export const createResearchFunction = async (formData: IResearchFunction) => {
    return instance.post(
        "projects/research_functions", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateResearchFunction = async (formData: IResearchFunction) => {
    return instance.put(
        `projects/research_functions/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteResearchFunction = async (pk: number) => {
    return instance.delete(
        `projects/research_functions/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}


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
}

export const createDepartmentalService = async (formData: IDepartmentalService) => {
    return instance.post(
        "agencies/services", formData
    ).then(res => {
        return res.data;
    }
    );
}

export const updateDepartmentalService = async (formData: IDepartmentalService) => {
    return instance.put(
        `agencies/services/${formData.pk}`, formData
    ).then(res => {
        return res.data;
    }
    );
}

export const deleteDepartmentalService = async (pk: number) => {
    return instance.delete(
        `agencies/services/${pk}`
    ).then(res => {
        return res.data;
    }
    );
}





