import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProjectPayload } from "@/features/projects/types/project.types";
import { apiClient } from "@/shared/services/api/client.service";

/**
 * Separate base project fields from related model fields
 */
function splitPayload(data: UpdateProjectPayload) {
	const baseFields: Record<string, unknown> = {};
	const detailFields: Record<string, unknown> = {};
	const externalFields: Record<string, unknown> = {};
	const studentFields: Record<string, unknown> = {};

	// Base project model fields
	const BASE_KEYS = [
		"title",
		"description",
		"keywords",
		"start_date",
		"end_date",
		"business_area",
		"image",
	];

	// ProjectDetail model fields
	const DETAIL_KEYS = ["service", "data_custodian", "project_leader"];

	// ExternalProjectDetails model fields
	const EXTERNAL_KEYS = [
		"collaboration_with",
		"budget",
		"external_description",
		"aims",
	];

	// StudentProjectDetails model fields
	const STUDENT_KEYS = ["organisation", "level"];

	for (const [key, value] of Object.entries(data)) {
		if (key === "project_areas") continue; // Handled separately
		if (value === undefined) continue;

		if (BASE_KEYS.includes(key)) {
			baseFields[key] = value;
		} else if (DETAIL_KEYS.includes(key)) {
			// Map project_leader to owner for the backend
			if (key === "project_leader") {
				detailFields["owner"] = value;
			} else {
				detailFields[key] = value;
			}
		} else if (EXTERNAL_KEYS.includes(key)) {
			// Map external_description to description for the backend model
			if (key === "external_description") {
				externalFields["description"] = value;
			} else {
				externalFields[key] = value;
			}
		} else if (STUDENT_KEYS.includes(key)) {
			studentFields[key] = value;
		}
	}

	return { baseFields, detailFields, externalFields, studentFields };
}

interface UpdateProjectArgs {
	id: number;
	data: UpdateProjectPayload;
	detailId?: number;
	externalDetailId?: number;
	studentDetailId?: number;
}

/**
 * Update a project and its related models
 */
async function updateProject({
	id,
	data,
	detailId,
	externalDetailId,
	studentDetailId,
}: UpdateProjectArgs): Promise<void> {
	const { baseFields, detailFields, externalFields, studentFields } =
		splitPayload(data);

	const promises: Promise<unknown>[] = [];

	// Update base project fields
	if (Object.keys(baseFields).length > 0) {
		if (baseFields.image instanceof File) {
			const formData = new FormData();
			formData.append("image", baseFields.image as File);
			for (const [key, value] of Object.entries(baseFields)) {
				if (key !== "image" && value !== null && value !== undefined) {
					formData.append(key, String(value));
				}
			}
			promises.push(
				apiClient.patch(`projects/${id}`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				})
			);
		} else {
			// Remove image from base fields if it's a URL string (no change)
			const payload = { ...baseFields };
			if (typeof payload.image === "string") {
				delete payload.image;
			}
			promises.push(apiClient.patch(`projects/${id}`, payload));
		}
	}

	// Update project detail fields (service, data_custodian, owner)
	if (Object.keys(detailFields).length > 0 && detailId) {
		promises.push(
			apiClient.put(`projects/project_details/${detailId}`, detailFields)
		);
	}

	// Update project areas
	if (data.project_areas !== undefined) {
		promises.push(
			apiClient.put(`projects/${id}/areas`, { areas: data.project_areas })
		);
	}

	// Update external project details
	if (Object.keys(externalFields).length > 0 && externalDetailId) {
		promises.push(
			apiClient.patch(
				`projects/external_project_details/${externalDetailId}`,
				externalFields
			)
		);
	}

	// Update student project details
	if (Object.keys(studentFields).length > 0 && studentDetailId) {
		promises.push(
			apiClient.put(
				`projects/student_project_details/${studentDetailId}`,
				studentFields
			)
		);
	}

	await Promise.all(promises);
}

/**
 * Hook to update a project and all its related models
 */
export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (args: UpdateProjectArgs) => updateProject(args),
		onSuccess: (_data, variables) => {
			// Invalidate project detail query
			queryClient.invalidateQueries({
				queryKey: ["projects", "detail", variables.id],
			});

			// Invalidate project list query
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update project:", error);
		},
	});
}
