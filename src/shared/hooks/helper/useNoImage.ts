import { useUIStore } from "@/app/stores/store-context";

export const useNoImage = () => {
	const uiStore = useUIStore();
	const image =
		uiStore.theme === "dark" ? "/no-image-dark.png" : "/no-image-light2.jpg";
	return image;
};
