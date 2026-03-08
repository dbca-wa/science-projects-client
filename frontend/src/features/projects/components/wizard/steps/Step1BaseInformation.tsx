import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { ImageUpload } from "@/shared/components/media/ImageUpload";
import { KeywordsInput } from "@/shared/components/KeywordsInput";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { validateStep1 } from "../validation/step1.validation";

/**
 * Step1BaseInformation component
 *
 * Collects core project information with rich text editing.
 * Reuses FormRichTextEditor, ImageUpload, and KeywordsInput components.
 */
export const Step1BaseInformation = observer(function Step1BaseInformation() {
	const store = useCreateProjectWizardStore();
	const { formData } = store.state;

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Validate on mount and when data changes
	useEffect(() => {
		const validation = validateStep1(formData);
		setErrors(validation.errors);
		store.setStepValidation(0, validation.isValid, validation.errors);
	}, [formData, store]);

	const handleTitleChange = (value: string) => {
		store.setBaseInformation({ title: value });
	};

	const handleDescriptionChange = (value: string) => {
		store.setBaseInformation({ description: value });
	};

	const handleImageChange = (file: File | string | null) => {
		store.setBaseInformation({ image: file });
	};

	const handleKeywordsChange = (keywords: string[]) => {
		store.setBaseInformation({ keywords });
	};

	return (
		<div className="space-y-6">
			{/* Title */}
			<div className="space-y-2">
				<FormRichTextEditor
					label="Project Title"
					description="Enter a clear, descriptive title for your project"
					value={formData.title}
					onChange={handleTitleChange}
					placeholder="Enter project title..."
					toolbar="projectTitle"
					error={errors.title}
				/>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<FormRichTextEditor
					label="Project Description"
					description="Provide a detailed description of your project"
					value={formData.description}
					onChange={handleDescriptionChange}
					placeholder="Enter project description..."
					toolbar="full"
					error={errors.description}
				/>
			</div>

			{/* Keywords */}
			<div className="space-y-2">
				<label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
					Keywords
				</label>
				<p className="text-sm text-muted-foreground">
					Add keywords to help others find your project. Use commas to add
					multiple at once.
				</p>

				<KeywordsInput
					value={formData.keywords}
					onChange={handleKeywordsChange}
					placeholder="e.g. biodiversity, conservation, research"
					error={errors.keywords}
				/>
			</div>

			{/* Project Image */}
			<div className="space-y-2">
				<label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
					Project Image (Optional)
				</label>
				<p className="text-sm text-muted-foreground">
					Upload an image to represent your project
				</p>
				<ImageUpload
					value={formData.image}
					onChange={handleImageChange}
					variant="project"
					allowUrl={false}
					placeholder="Upload a project image"
					helperText="Aspect ratio: 25:18"
				/>
			</div>
		</div>
	);
});
