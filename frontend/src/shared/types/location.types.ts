// LOCATION ============================================================================

export interface OrganisedLocationData {
	[key: string]: ISimpleLocationData[];

	dbcaregion: ISimpleLocationData[];
	dbcadistrict: ISimpleLocationData[];
	ibra: ISimpleLocationData[];
	imcra: ISimpleLocationData[];
	nrm: ISimpleLocationData[];
}

export interface ISimpleLocationData {
	pk: number;
	name: string;
	area_type: string;
}

export interface IProjectAreas {
	created_at: Date;
	updated_at: Date;
	project: number;
	id: number;
	areas: ISimpleLocationData[];
}

export interface IAddLocationForm {
	old_id?: number;
	pk?: string;
	name: string;
	area_type: string;
}
