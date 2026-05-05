import { Megaphone } from "lucide-react";

interface HomepageBannerProps {
	message: string;
}

/**
 * Dashboard banner component — displays an admin-configured message
 * below the welcome section when enabled.
 */
export const HomepageBanner = ({ message }: HomepageBannerProps) => (
	<div
		className="rounded-xl border border-blue-200/80 dark:border-blue-700/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 px-5 py-4 shadow-sm"
		role="status"
		aria-label="System announcement"
	>
		<div className="flex items-center gap-2.5 mb-2">
			<Megaphone className="size-4 text-blue-500 dark:text-blue-400" />
			<p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
				Announcement
			</p>
		</div>
		<div
			className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-sm [&_li]:leading-relaxed [&_ul]:my-1.5 [&_ol]:my-1.5 [&_p]:my-1 [&_ul]:pl-1 [&_ol]:pl-5 [&_ul]:list-none [&_ul_li]:relative [&_ul_li]:pl-5 [&_ul_li]:before:content-['›'] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:text-blue-400 [&_ul_li]:before:font-bold [&_ol]:list-decimal [&_li]:py-0.5 max-w-none"
			dangerouslySetInnerHTML={{ __html: message }}
		/>
	</div>
);
