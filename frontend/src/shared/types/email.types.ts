// EMAILS ============================================================================

import type { AxiosError, AxiosResponse } from "axios";
import type { IUserData, IUserMe } from "./user.types";

export interface IEmailListUser {
	id: number;
	name: string;
	email: string;
}

export interface ISendSingleEmail {
	fromUserId: number;
	fromUserEmail: string;
	fromUserName: string;
	toUserId?: number;
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
