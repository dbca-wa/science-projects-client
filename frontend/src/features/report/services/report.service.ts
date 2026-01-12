import { apiClient } from "@/shared/services/api/client.service";
import { REPORT_ENDPOINTS } from "./report.endpoints";
import type { IReport, IReportCreation } from "@/shared/types/report.types";
import type {
	IReportMediaDeleteProps,
	IReportMediaUploadProps,
} from "../types/report.types";

export const getAvailableReportYearsForProgressReport = async (
	pk: number
): Promise<number[]> => {
	return apiClient.get<number[]>(
		REPORT_ENDPOINTS.AVAILABLE_YEARS.PROGRESS(pk)
	);
};

export const getAvailableReportYearsForStudentReport = async (
	pk: number
): Promise<number[]> => {
	return apiClient.get<number[]>(
		REPORT_ENDPOINTS.AVAILABLE_YEARS.STUDENT(pk)
	);
};

export const getLatestReportingYear = async (): Promise<{ year: number }> => {
	return apiClient.get<{ year: number }>(REPORT_ENDPOINTS.LATEST_YEAR);
};

export const getCompletedReports = async (): Promise<IReport[]> => {
	return apiClient.get<IReport[]>(REPORT_ENDPOINTS.COMPLETED);
};

export const getAllReports = async (): Promise<IReport[]> => {
	return apiClient.get<IReport[]>(REPORT_ENDPOINTS.LIST);
};

export const getReportPDFs = async (): Promise<unknown[]> => {
	return apiClient.get<unknown[]>(REPORT_ENDPOINTS.MEDIA.LIST);
};

export const getReportMedia = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(REPORT_ENDPOINTS.MEDIA.DETAIL(pk));
};

export const getAnnualReportPDF = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(REPORT_ENDPOINTS.PDF(pk));
};

export const getLatestReportMedia = async (): Promise<unknown> => {
	return apiClient.get<unknown>(REPORT_ENDPOINTS.MEDIA.LATEST);
};

export const uploadReportMediaImage = async ({
	pk,
	file,
	section,
}: IReportMediaUploadProps): Promise<unknown> => {
	const formData = new FormData();
	formData.append("section", section);
	formData.append("file", file);

	return apiClient.post<unknown>(REPORT_ENDPOINTS.MEDIA.UPLOAD(pk), formData);
};

export const deleteReportMediaImage = async ({
	pk,
	section,
}: IReportMediaDeleteProps): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		REPORT_ENDPOINTS.MEDIA.DELETE(pk, section)
	);
};

export const getFullReport = async (pk: number): Promise<IReport> => {
	return apiClient.get<IReport>(REPORT_ENDPOINTS.DETAIL(pk));
};

export const getFullLatestReport = async (): Promise<IReport> => {
	return apiClient.get<IReport>(REPORT_ENDPOINTS.LATEST);
};

export const createReport = async (
	formData: IReportCreation
): Promise<IReport> => {
	const { year, ...otherData } = formData;

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const generateDates = (year: number) => {
		const startDate = new Date(year - 1, 6, 1);
		const endDate = new Date(year, 5, 30);
		return [formatDate(startDate), formatDate(endDate)];
	};

	const [formattedDateOpen, formattedDateClosed] = generateDates(year);

	const dataToSend = {
		year,
		date_open: formattedDateOpen,
		date_closed: formattedDateClosed,
		...otherData,
	};

	return apiClient.post<IReport>(REPORT_ENDPOINTS.CREATE, dataToSend);
};

export const updateReportMedia = async (
	_formData: IReport
): Promise<{ status: number; message: string }> => {
	return {
		status: 200,
		message: "ok",
	};
};

export const updateReport = async (formData: IReport): Promise<IReport> => {
	const { date_open, date_closed, ...otherData } = formData;

	const formatDate = (date: Date | string | null): string | null => {
		if (date === null) {
			return null;
		}

		if (typeof date === "string") {
			date = new Date(date);
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

	return apiClient.put<IReport>(
		REPORT_ENDPOINTS.UPDATE(formData.pk),
		dataToSend
	);
};

export const deleteReport = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(REPORT_ENDPOINTS.DELETE(pk));
};
