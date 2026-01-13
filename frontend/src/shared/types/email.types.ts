// EMAILS ============================================================================

import type { AxiosError, AxiosResponse } from "axios";
import type { IUserData, IUserMe } from "./user.types";

export interface IEmailListUser {
	pk: number;
	name: string;
	email: string;
}

export interface ISendSingleEmail {
	fromUserPk: number;
	fromUserEmail: string;
	fromUserName: string;
	toUserPk?: number;
	toUserEmail: string;
	toUserName?: string;
	project?: number;
	projectTitle?: string;
	projectDocumentKind?:
		| "concept"
		| "projectplan"
		| "progressreport"
		| "studentreport"
		| "projectclosure";
	stage?: number;
}

export interface IEmailModalProps {
	isOpen: boolean;
	onClose: () => void;
	thisUser: IUserMe;
	emailFunction: (props?: unknown) => Promise<AxiosResponse | AxiosError>; // Allow props to be optional
}

export type EmailListPerson = IUserData | IEmailListUser;
