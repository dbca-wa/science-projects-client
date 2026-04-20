import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { EmailPageContent } from "@/features/admin/components/emails/EmailPageContent";

export default function EmailsPage() {
	useDocumentTitle("Email");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Email
			</h1>
			<EmailPageContent />
		</div>
	);
}
