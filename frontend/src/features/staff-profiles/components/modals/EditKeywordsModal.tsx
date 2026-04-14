import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { X } from "lucide-react";
import { useUpdateOverview } from "../../hooks/useStaffProfileMutations";
import type { IKeywordTag } from "../../types/staff-profile.types";
import ResponsiveModal from "./ResponsiveModal";

interface EditKeywordsModalProps {
	profilePk: number;
	currentKeywords: IKeywordTag[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditKeywordsModal = ({
	profilePk,
	currentKeywords,
	open,
	onOpenChange,
}: EditKeywordsModalProps) => {
	const [keywords, setKeywords] = useState<IKeywordTag[]>(currentKeywords);
	const [inputValue, setInputValue] = useState("");
	const mutation = useUpdateOverview(profilePk);

	const handleAddKeyword = () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		if (keywords.some((k) => k.name.toLowerCase() === trimmed.toLowerCase()))
			return;
		setKeywords([...keywords, { id: -Date.now(), name: trimmed }]);
		setInputValue("");
	};

	const handleRemoveKeyword = (id: number) => {
		setKeywords(keywords.filter((k) => k.id !== id));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddKeyword();
		}
	};

	const handleSave = () => {
		mutation.mutate(
			{ keyword_tags: keywords.map((k) => k.id) },
			{ onSuccess: () => onOpenChange(false) }
		);
	};

	return (
		<ResponsiveModal
			title="Edit Keywords"
			open={open}
			onOpenChange={onOpenChange}
		>
			<div className="flex gap-2">
				<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add a keyword..."
					className="flex-1"
				/>
				<Button onClick={handleAddKeyword} variant="outline" size="sm">
					Add
				</Button>
			</div>
			<div className="flex flex-wrap gap-2 mt-3 min-h-[40px]">
				{keywords
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((tag) => (
						<span
							key={tag.id}
							className="inline-flex items-center gap-1 rounded-md bg-[#2A6096] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
						>
							{tag.name.trim().replace(/\b\w/g, (l) => l.toUpperCase())}
							<button
								onClick={() => handleRemoveKeyword(tag.id)}
								className="ml-0.5 hover:text-red-200"
								aria-label={`Remove ${tag.name}`}
							>
								<X className="size-3" />
							</button>
						</span>
					))}
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={mutation.isPending}>
					{mutation.isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default EditKeywordsModal;
