import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface KBHeroSearchProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

export const KBHeroSearch = ({
	searchQuery,
	onSearchChange,
}: KBHeroSearchProps) => {
	return (
		<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16">
			{/* Decorative background circles */}
			<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
			<div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

			<div className="relative mx-auto max-w-2xl text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					How can we help?
				</h1>
				<p className="mt-3 text-blue-100 text-base sm:text-lg">
					Search the knowledge base or browse categories below.
				</p>

				<div className="relative mt-8">
					<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search articles..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-12 rounded-xl border-0 bg-white pl-12 text-base text-foreground shadow-md placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/50"
						aria-label="Search knowledge base articles"
					/>
				</div>
			</div>
		</section>
	);
};
