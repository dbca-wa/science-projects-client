import { observer } from "mobx-react-lite";
import { useEffect, useCallback, memo } from "react";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { Label } from "@/shared/components/ui/label";
import { ImageUpload } from "@/shared/components/media/ImageUpload";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { KeywordInput } from "@/shared/components/KeywordInput";
import { isRichTextEmpty } from "@/shared/utils/rich-text.utils";
import { FieldError } from "../FieldError";
import { shouldShowError } from "../validation-helpers";
import { SectionCard } from "../SectionCard";

/**
 * Stable RTE wrappers — memoised so they never re-render from parent
 * observer updates. This prevents Lexical from losing focus when the
 * MobX store changes. The RTE manages its own internal state; onChange
 * pushes updates to the store without causing a re-render of this wrapper.
 */
const StableTitleEditor = memo(
	({
		initialValue,
		onChange,
	}: {
		initialValue: string;
		onChange: (html: string) => void;
	}) => (
		<FormRichTextEditor
			value={initialValue}
			onChange={onChange}
			placeholder="Enter a descriptive title for your project"
			toolbar="projectTitle"
			minHeight="80px"
			aria-label="Project title"
		/>
	),
	// Never re-render — the RTE handles its own content internally
	() => true
);
StableTitleEditor.displayName = "StableTitleEditor";

const StableDescriptionEditor = memo(
	({
		initialValue,
		onChange,
	}: {
		initialValue: string;
		onChange: (html: string) => void;
	}) => (
		<RichTextEditor
			value={initialValue}
			onChange={onChange}
			placeholder="A concise project summary, or any additional useful information..."
			toolbar="projectDescription"
			minHeight="200px"
			aria-label="Project summary"
			className="rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20 transition-all duration-300 bg-white dark:bg-gray-800"
		/>
	),
	// Never re-render — the RTE handles its own content internally
	() => true
);
StableDescriptionEditor.displayName = "StableDescriptionEditor";

/**
 * BaseInformationStep - Step 1 of project creation wizard
 *
 * Collects:
 * - Title (required, max 150 chars)
 * - Description/Summary (required, rich text)
 * - Keywords (required, tag input)
 * - Image (optional, project image)
 *
 * Updates the MobX store directly on every change for live preview and
 * persistence. RTE components are wrapped in React.memo with a custom
 * comparator that always returns true (never re-render), preventing
 * Lexical from losing focus when the observer parent re-renders.
 */
const BaseInformationStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.baseInformation;
	const validation = wizardStore.state.validation[0];
	const stepIndex = 0;

	const handleFieldBlur = useCallback(
		(fieldName: string) => {
			wizardStore.markFieldTouched(fieldName);
		},
		[wizardStore]
	);

	// Validate on every form data change
	useEffect(() => {
		const errors: Record<string, string> = {};

		if (isRichTextEmpty(formData.title)) {
			errors.title = "Title is required";
		}

		if (isRichTextEmpty(formData.description)) {
			errors.description = "Description is required";
		}

		if (!formData.keywords || formData.keywords.length === 0) {
			errors.keywords = "At least one keyword is required";
		}

		const isValid = Object.keys(errors).length === 0;
		wizardStore.setStepValidation(0, isValid, errors);
	}, [formData.title, formData.description, formData.keywords, wizardStore]);

	// Stable callbacks — these never change reference so the memo wrappers
	// don't need to care about them
	const handleTitleChange = useCallback(
		(html: string) => {
			wizardStore.setBaseInformation({ title: html });
		},
		[wizardStore]
	);

	const handleDescriptionChange = useCallback(
		(html: string) => {
			wizardStore.setBaseInformation({ description: html });
		},
		[wizardStore]
	);

	const handleImageChange = useCallback(
		(file: File | string | null) => {
			if (file instanceof File) {
				wizardStore.setBaseInformation({ image: file });
			} else if (file === null) {
				wizardStore.setBaseInformation({ image: null });
			}
		},
		[wizardStore]
	);

	const handleKeywordsChange = useCallback(
		(keywords: string[]) => {
			wizardStore.setBaseInformation({ keywords });
		},
		[wizardStore]
	);

	// Compute section completion states
	const isImageComplete = formData.image !== null;
	const isContentComplete =
		!isRichTextEmpty(formData.title) &&
		!isRichTextEmpty(formData.description) &&
		formData.keywords.length > 0;

	return (
		<div className="space-y-6">
			{/* Image Section */}
			<SectionCard
				title="Project Image"
				isComplete={isImageComplete}
				completionLabel="Image section complete"
			>
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
			</SectionCard>

			{/* Title + Description + Keywords Section */}
			<SectionCard
				title="Project Details"
				isComplete={isContentComplete}
				completionLabel="Project details section complete"
			>
				<div className="space-y-6">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Project Title <span className="text-destructive">*</span>
						</Label>
						<StableTitleEditor
							initialValue={formData.title}
							onChange={handleTitleChange}
						/>
						{shouldShowError(wizardStore, "title", stepIndex) && (
							<FieldError error={validation?.errors.title} />
						)}
						<p className="text-xs text-muted-foreground">
							The project title with formatting if required (e.g. for taxonomic
							names)
						</p>
					</div>

					{/* Description/Summary */}
					<div className="space-y-2">
						<Label htmlFor="description">
							Project Summary <span className="text-destructive">*</span>
						</Label>
						<StableDescriptionEditor
							initialValue={formData.description}
							onChange={handleDescriptionChange}
						/>
						{shouldShowError(wizardStore, "description", stepIndex) && (
							<FieldError error={validation?.errors.description} />
						)}
						<p className="text-xs text-muted-foreground">
							A concise project summary, or any additional useful information
						</p>
					</div>

					{/* Keywords */}
					<div className="space-y-2">
						<Label htmlFor="keywords">
							Keywords <span className="text-destructive">*</span>
						</Label>
						<KeywordInput
							keywords={formData.keywords}
							onKeywordsChange={handleKeywordsChange}
							placeholder="Type a keyword and press Enter (use ; for multiple)"
							onBlur={() => handleFieldBlur("keywords")}
						/>
						{shouldShowError(wizardStore, "keywords", stepIndex) && (
							<FieldError error={validation?.errors.keywords} />
						)}
						<p className="text-xs text-muted-foreground">
							Add keywords to help others find your project. Use semicolons (;)
							to add multiple keywords at once.
						</p>
					</div>
				</div>
			</SectionCard>
		</div>
	);
});

export { BaseInformationStep };
