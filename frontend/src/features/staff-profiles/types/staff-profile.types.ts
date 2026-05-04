/**
 * Staff profile type definitions
 * Matches backend serializer response shapes
 */

// Keyword tag (from KeywordTagSerializer - fields = "__all__")
export interface IKeywordTag {
	id: number;
	name: string;
}

// Directory listing card (from TinyStaffProfileSerializer + IT Assets enrichment)
export interface IStaffProfileCard {
	id: number;
	user: {
		id: number;
		first_name: string;
		last_name: string;
		email: string;
	};
	image: string | null;
	business_area: { id: number; name: string } | null;
	about: string | null;
	expertise: string | null;
	is_hidden: boolean;
	// IT Assets enrichment fields
	division: string | null;
	unit: string | null;
	location: { name: string } | null;
	position: string | null;
	custom_title: string | null;
	custom_title_on: boolean;
}

// Paginated list response from StaffProfiles view
export interface IStaffProfileListResponse {
	users: IStaffProfileCard[];
	total_results: number;
	page: number;
	total_pages: number;
	it_assets_available: boolean;
	showing_hidden: boolean;
}

// Hero section (from StaffProfileHeroSerializer + IT Assets enrichment)
export interface IStaffProfileHeroData {
	id: number;
	user: {
		id: number;
		first_name: string;
		last_name: string;
		email: string | null;
	};
	avatar: { file: string } | null;
	work: {
		id: number;
		role: string | null;
		business_area: { id: number; name: string } | null;
	} | null;
	about: string | null;
	employee_id: string | null;
	is_hidden: boolean;
	it_asset_data: {
		title: string | null;
		unit: string | null;
		division: string | null;
		location: { name: string } | string | null;
	} | null;
}

// Overview section (from StaffProfileOverviewSerializer)
export interface IStaffOverviewData {
	id: number;
	about: string | null;
	expertise: string | null;
	keywords: IKeywordTag[];
}

// Employment entry (from EmploymentEntrySerializer - fields = "__all__")
export interface IEmploymentEntry {
	id: number;
	public_profile: number;
	position_title: string;
	start_year: number;
	end_year: number | null;
	section: string | null;
	employer: string | null;
}

// Education entry (from EducationEntrySerializer - fields = "__all__")
export interface IEducationEntry {
	id: number;
	public_profile: number;
	qualification_name: string;
	end_year: number;
	institution: string;
	location: string;
}

// CV section (from StaffProfileCVSerializer)
export interface IStaffCVData {
	id: number;
	employment_entries: IEmploymentEntry[];
	education_entries: IEducationEntry[];
}

// Staff profile projects response (from ProjectDataTableSerializer)
export interface IStaffProfileProject {
	id: number;
	title: string;
	status: string;
	kind: string;
	role: string | null;
	description: string | null;
	start_date: number | null;
	end_date: number | null;
	image: { file: string } | null;
	business_area: { id: number; name: string } | null;
}

// Form data types for mutations
export interface IEmploymentEntryFormData {
	position_title: string;
	start_year: number;
	end_year?: number | null;
	section?: string;
	employer?: string;
}

export interface IEducationEntryFormData {
	qualification_name: string;
	end_year: number;
	institution: string;
	location: string;
}

export interface IOverviewUpdateData {
	about?: string;
	expertise?: string;
	keyword_tags?: number[];
}

// Library publication from external API
export interface ILibraryPublication {
	title: string;
	year: string;
	BiblioText: string;
	staff_only?: boolean;
}

export interface ILibraryPublicationResponse {
	docs: ILibraryPublication[];
}

export interface IPublicationResponse {
	libraryData: ILibraryPublicationResponse;
}
