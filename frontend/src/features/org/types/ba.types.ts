import type { BusinessAreaImage } from "@/shared/types/media.types";

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
