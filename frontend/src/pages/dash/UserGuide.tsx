import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";

const UserGuide = () => {
	useDocumentTitle("Guide");

	return (
		<PageTransition>
			<div className="w-full">
				<AutoBreadcrumb />

				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Guide</h1>
					<p className="text-muted-foreground">
						Learn how to use the Science Project Management System.
					</p>
				</div>

				<div className="text-muted-foreground text-center py-12">
					<p>Guide content coming soon.</p>
				</div>
			</div>
		</PageTransition>
	);
};

export default UserGuide;
