import { ReactNode } from "react";


// USER ============================================================================

export interface IUserData {
    pk: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
    image: IImageData;
    business_area: IBusinessArea | undefined;
    role: string;
    branch: IBranch;
    affiliation: string;
    branches?: IBranch[];
    businessAreas?: IBusinessArea[];
}

export interface IMemberUserDetails {
    pk: number;
    is_staff: boolean;
    is_superuser: boolean;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    business_area: string | null;
    branch: string | null;
    role: string | null;
    image: IImageData;
}

export interface IPersonalInformation {
    first_name: string;
    last_name: string;
    email: string;
    title: string;
    phone: string;
    fax: string;
}

export interface IProfile {
    image: any;
    about: string;
    expertise: string;
}


// PROJECT DETAILS ============================================================================

interface ISmallUser {
    id: number;
    username: string;
}

interface ISmallProject {
    id: number;
    title: string;
}

interface ISmallResearchFunction {
    id: number;
    name: string;
}

interface IBaseProjectDetails {
    id: number;
    created_at: Date;
    updated_at: Date;
    creator: ISmallUser;
    modifier: ISmallUser;
    data_custodian: ISmallUser | null;
    site_custodian: ISmallUser | null;
    owner: ISmallUser;
    project: ISmallProject;
    research_function: ISmallResearchFunction | null;
}

interface IStudentProjectDetails {
    id: number;
    old_id: number | null;
    level: string;
    organisation: "string";
    project: ISmallProject;
}

interface IExternalProjectDetails {
    id: number;
    old_id: number | null;
    project: ISmallProject;
    aims: string | null;
    budget: string | null;
    collaboration_with: string | null;
    description: string | null;
}

interface IFullProjectDetails {
    base: IBaseProjectDetails;
    external: IExternalProjectDetails | [];
    student: IStudentProjectDetails | [];
}

// PROJECT DOCUMENTS ============================================================================

interface IConceptPlan {
    pk: number;
    document: number;
    background: string | null;
    aims: string | null;
    outcome: string | null;
    collaborations: string | null;
    strategic_context: string | null;
    staff_time_allocation: string | null;
    budget: string | null;
}


interface IEndorsement {
    pk: number;
    project_plan: number;
    bm_endorsement: boolean;
    hc_endorsement: boolean;
    ae_endorsement: boolean;
    data_manager_endorsement: boolean;
    data_management: string;
    no_specimens: string;
}

interface IProjectPlan {
    pk: number;
    document: number;
    background: string | null;
    aims: string | null;
    outcome: string | null;
    knowledge_transfer: string | null;
    listed_references: string | null;
    involves_plants: boolean;
    involves_animals: boolean;
    operating_budget: string | null;
    operating_budget_external: string | null;
    methodology: string | null;
    project_tasks: string | null;
    related_projects: string | null;
    endorsemeents: IEndorsement;
}

interface IProgressReport {
    pk: number;
    document: number;
    year: number;
    is_final_report: boolean;
    context: string | null;
    aims: string | null;
    progress: string | null;
    implications: string | null;
    future: string | null;
}

interface IStudentReport {
    pk: number;
    document: number;
    progress_report: string;
    year: number;
}

interface IProjectClosure {
    pk: number;
    document: number;
    intended_outcome: string | null;
    reason: string | null;
    scientific_outputs: string | null;
    knowledge_transfer: string | null;
    data_location: string | null;
    hardcopy_location: string | null;
    backup_location: string | null;
}

interface IProjectDocuments {
    concept_plan: IConceptPlan | null;
    project_plan: IProjectPlan | null;
    progress_reports: IProgressReport[] | [];
    student_reports: IStudentReport[] | [];
    project_closure: IProjectClosure | null;
}


// PROJECT MEMBERS ============================================================================


interface IProjectMember {
    pk: number;
    project: number;
    is_leader: boolean;
    user: IMemberUserDetails;
    role: string;
    time_allocation: number;
    position: number;
    short_code: number | null;
}


// PROJECT ============================================================================



interface IProjectData {
    pk: number;
    id?: number;
    kind: string;
    title: string;
    status: string;
    description: string;
    tagline: string;
    image: ProjectImage;
    keywords: string;
    year: number;
    number: number;
    start_date: Date;
    end_date: Date;
    business_area_id: number;

    created_at: Date;
    updated_at: Date;
}


interface IFullProjectDetails {
    project: IProjectData;
    details: IFullProjectDetails;
    documents: IProjectDocuments;
    members: IProjectMember[] | null;
}


// TASKS ============================================================================

interface ITaskUser {
    pk: number;
    first_name: string;
    last_name: string;
}

interface ITaskProject {
    pk: number;
    title: string;
    status: string;
    kind: string;
    year: number;
    business_area: IBusinessArea;
    image: IImageData;
}

interface ITaskDocument {
    pk: number;
    kind: string;
    status: string;
    project: ITaskProject;
}

export interface IQuickTask {
    user: number; //pk
    name: string;
    description: string;
}

export interface ITaskDisplayCard {
    pk: number;
    creator: ITaskUser;
    user: ITaskUser;
    project: ITaskProject;
    document: ITaskDocument;

    name: string;
    description: string;
    notes: string;
    status: string;
    task_type: string;

    date_assigned: Date;
}

// LOCATION ============================================================================


interface OrganisedLocationData {
    [key: string]: ISimpleLocationData[];

    dbcaregion: ISimpleLocationData[];
    dbcadistrict: ISimpleLocationData[];
    ibra: ISimpleLocationData[];
    imcra: ISimpleLocationData[];
    nrm: ISimpleLocationData[];
}

interface ISimpleLocationData {
    pk: number;
    name: string;
    area_type: string;
}

interface IAddLocationForm {
    old_id: number;
    pk: string;
    name: string;
    area_type: string;
}


// IMAGE ============================================================================


interface IImageData {
    file: string;
    old_file: string;
    pk: number;
    user: number;
}


interface ProjectImage {
    pk: number;
    old_file: string;
    file: string;
}

interface BusinessAreaImage {
    pk: number;
    old_file: string;
    file: string;
}


// BUSINESS AREA ============================================================================


interface IBusinessArea {
    pk: number;
    slug: string;
    name: string;
    focus: string;
    introduction: string;
    image: BusinessAreaImage;
    leader: number;
    finance_admin: number;
    data_custodian: number;


    // effective_from: Date;
    //effective_to: Date;   // always null, delete ?

    // creator_id: number; // necessary?
    // modifier_id: number; // necessary?

    //  date_created: Date;     // Converter needed?
    // last_modified: Date;
}


// RESEARCH FUNCTION ============================================================================


interface IResearchFunction {
    name: string;
    description: string;
    association: string; // What program this research funciton belongs to
    leader: number;
    is_active: boolean; // Whether Research Function is still active
    pk: number;
}

// SERVICE ============================================================================

interface IDepartmentalService {
    name: string;
    director: number;
    pk: number;
}

// AGENCY ============================================================================

interface IAgency {
    pk: number;
    key_stakeholder: number;
    is_active: boolean;
}


// BRANCH ============================================================================

interface IBranch {
    pk: number;
    agency: number;
    name: string;
    manager: number;
    old_id: number;
}

// ADDRESS ============================================================================

interface IAddress {
    pk: number;
    agency: IAgency;
    branch: IBranch;
    street: string;
    suburb: string;
    city: string;
    zipcode: number;
    state: string;
    country: string;
    pobox: string;
}

// DIVISIONS ============================================================================


interface IDivision {
    pk: number;
    old_id: number;
    name: string;
    slug: string;
    director: number;
    approver: number;
}


// REPORT ============================================================================

interface ITinyReportMedia {
    pk: number;
    kind: string;
    old_file: string;
    file: string;
    report: number;
}

export interface ISmallReport {
    pk: number;
    date_open: Date | null;
    date_closed: Date | null;
    year: number | null;
    creator: number;
    media: ITinyReportMedia;
}


export interface IReport {
    pk: number;
    created_at: Date;
    updated_at: Date | null;
    date_open: Date | null;
    date_closed: Date | null;
    year: number;

    creator: number;
    modifier: number;

    dm: string | null;
    publications: string | null;
    research_intro: string | null;
    service_delivery_intro: string | null;
    student_intro: string | null;
}

// QUOTE ====================================================================


export interface IQuote {
    text: string;
    author: string;
}


// FRONTEND TYPES ====================================================================

interface INavitar {
    isModern: boolean;
    shouldShowName?: boolean;
    // userData: IUserData;
    windowSize: number;
}

interface ISearchTerm {
    searchTerm: string;
}



export interface IDesignProps {
    isModern?: boolean;
}

export interface SubDirectory {
    title: string;
    link: string;
}

export interface IBreadCrumbProps {
    subDirOne: SubDirectory;
    subDirTwo?: SubDirectory;
    subDirThree?: SubDirectory;
    rightSideElement?: ReactNode;
}


export interface IToolbarButton {
    onClick: (event: string) => void;
}


// CHAT =====================================================================


interface IReaction {
    type: string;
    count: number;
}

interface IUser {
    first_name: string;
    last_name: string;
    username: string;
    avatar: string | null;
}

interface IChatMessage {
    sendingUser: IUser;
    timeSent: Date;
    payload: string;
    isRead: boolean;
    reactions: IReaction[];
}

interface ISingleChatData {
    chatWith: string;
    lastMessage: IChatMessage;
    isOnline: boolean | null;
}


interface IDashProps {
    activeTab?: number;
}