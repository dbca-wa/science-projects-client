import { QueryClient } from "@tanstack/react-query";
import { updateProfile, removeUserAvatar } from "../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import { sanitiseFormData } from "@/shared/utils";

/**
 * Profile form data structure
 */
export interface ProfileUpdateData {
	image?: File | string | null;
	about?: string;
	expertise?: string;
}

/**
 * Options for profile update
 */
export interface ProfileUpdateOptions {
	userId: number;
	data: ProfileUpdateData;
	queryClient: QueryClient;
	hasExistingImage: boolean;
}

/**
 * Handle profile update with image removal support
 *
 * This utility handles the complex logic of updating a user's profile,
 * including special handling for image removal.
 *
 * @param options - Profile update options
 * @returns Promise that resolves when update is complete
 *
 * @example
 * ```typescript
 * await handleProfileUpdate({
 *   userId: user.id,
 *   data: { image: null, about: "New about text" },
 *   queryClient,
 *   hasExistingImage: !!user.image,
 * });
 * ```
 */
export async function handleProfileUpdate({
	userId,
	data,
	queryClient,
	hasExistingImage,
}: ProfileUpdateOptions): Promise<void> {
	// Sanitise form data before submission
	const sanitisedData = sanitiseFormData(data as Record<string, unknown>, [
		"about",
		"expertise",
	]);

	// Handle image removal separately if image is null
	if (sanitisedData.image === null && hasExistingImage) {
		// First remove the avatar
		await removeUserAvatar(userId);

		// Then update other fields (without image)
		const { image: _image, ...restData } = sanitisedData;
		if (Object.keys(restData).length > 0) {
			await updateProfile(userId, restData);
		}

		// Invalidate queries to refresh UI
		await queryClient.invalidateQueries({
			queryKey: authKeys.user(),
			exact: true,
		});
		await queryClient.invalidateQueries({
			queryKey: ["users", "detail", userId],
		});
	} else {
		// Normal update (no removal)
		await updateProfile(userId, sanitisedData);

		// Invalidate queries to refresh UI
		await queryClient.invalidateQueries({
			queryKey: authKeys.user(),
			exact: true,
		});
		await queryClient.invalidateQueries({
			queryKey: ["users", "detail", userId],
		});
	}
}
