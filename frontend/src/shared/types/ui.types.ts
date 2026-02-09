import type { LexicalEditor } from "lexical";
import type { ReactNode } from "react";

export interface INavitar {
	shouldShowName?: boolean;
	// userData: IUserData;
	windowSize: number;
}

export interface ISearchTerm {
	searchTerm: string;
}

export interface IDesignProps {
	// Reserved for future design props
}

export interface SubDirectory {
	title: string;
	link: string;
}

export interface IBreadCrumbProps {
	subDirOne: SubDirectory;
	subDirTwo?: SubDirectory;
	subDirThree?: SubDirectory;
	rightSideElement?: ReactNode;
}

export interface IToolbarButton {
	onClick: (event: string) => void;
	editor: LexicalEditor;
	buttonIsOn?: boolean;
}
