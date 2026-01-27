import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { X, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/shared/components/media/ImageUpload";

/**
 * FieldError - Display validation error for a field
 */
const FieldError = ({ error }: { error?: string }) => {
	if (!error) return null;
	return (
		<div className="flex items-center gap-1 text-xs text-destructive mt-1">
			<AlertCircle className="h-3 w-3" />
			<span>{error}</span>
		</div>
	);
};

/**
 * BaseInformationStep - Step 1 of project creation wizard
 * 
 * Collects:
 * - Title (required, max 150 chars)
 * - Description/Summary (required, rich text)
 * - Keywords (required, tag input)
 * - Image (optional, project image)
 */
const BaseInformationStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.baseInformation;
	const validation = wizardStore.state.validation[0]; // Step 0 is Base Information

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		wizardStore.setBaseInformation({ title: e.target.value });
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		wizardStore.setBaseInformation({ description: e.target.value });
	};

	const handleImageChange = (file: File | string | null) => {
		// Only accept File objects, not URLs
		if (file instanceof File) {
			wizardStore.setBaseInformation({ image: file });
		} else if (file === null) {
			wizardStore.setBaseInformation({ image: null });
		}
	};

	const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && e.currentTarget.value.trim()) {
			e.preventDefault();
			const newKeyword = e.currentTarget.value.trim();
			if (!formData.keywords.includes(newKeyword)) {
				wizardStore.setBaseInformation({
					keywords: [...formData.keywords, newKeyword],
				});
			}
			e.currentTarget.value = "";
		}
	};

	const handleKeywordRemove = (keyword: string) => {
		wizardStore.setBaseInformation({
			keywords: formData.keywords.filter((k) => k !== keyword),
		});
	};

	return (
		<div className="space-y-6">
			{/* Title */}
			<div className="space-y-2">
				<Label htmlFor="title">
					Project Title <span className="text-destructive">*</span>
				</Label>
				<Input
					id="title"
					value={formData.title}
					onChange={handleTitleChange}
					placeholder="Enter a descriptive title for your project"
					maxLength={150}
					className="text-base"
				/>
				<FieldError error={validation?.errors.title} />
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>The project title with formatting if required (e.g. for taxonomic names)</span>
					<span>{formData.title.length}/150</span>
				</div>
			</div>

			{/* Keywords */}
			<div className="space-y-2">
				<Label htmlFor="keywords">
					Keywords <span className="text-destructive">*</span>
				</Label>
				<Input
					id="keywords"
					placeholder="Type a keyword and press Enter"
					onKeyDown={handleKeywordAdd}
					className="text-base"
				/>
				<FieldError error={validation?.errors.keywords} />
				<p className="text-xs text-muted-foreground">
					Add keywords to help others find your project
				</p>
				{formData.keywords.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-3">
						{formData.keywords.map((keyword) => (
							<Badge
								key={keyword}
								variant="secondary"
								className="gap-1 pr-1 text-sm"
							>
								{keyword}
								<button
									type="button"
									onClick={() => handleKeywordRemove(keyword)}
									className="ml-1 rounded-full hover:bg-muted p-0.5"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			{/* Description/Summary */}
			<div className="space-y-2">
				<Label htmlFor="description">
					Project Summary <span className="text-destructive">*</span>
				</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={handleDescriptionChange}
					placeholder="A concise project summary, or any additional useful information..."
					rows={8}
					className="text-base resize-none"
				/>
				<FieldError error={validation?.errors.description} />
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>A concise project summary</span>
					<span>{formData.description.length} characters</span>
				</div>
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<Label htmlFor="image">Project Image (Optional)</Label>
				<ImageUpload
					value={formData.image}
					onChange={handleImageChange}
					variant="project"
					allowUrl={false}
					helperText="JPG or PNG only, max 1MB. Image will be used in project cards and annual reports."
				/>
			</div>
		</div>
	);
});

export { BaseInformationStep };
