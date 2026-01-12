import { useStore } from "@/app/stores/useStore";

export const useNoImage = () => {
	const uiStore = useStore().uiStore;
	const image =
		uiStore.theme === "dark"
			? "/no-image-dark.png"
			: "/no-image-light2.jpg";
	return image;
};
