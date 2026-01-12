import { useNoImage } from "@/shared/hooks/helper/useNoImage";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { observer } from "mobx-react-lite";
import { API_CONFIG } from "@/shared/services/api/config";
import { Progress } from "@/shared/components/ui/progress";
import { useUIStore } from "@/app/stores/useStore";
import { handleImageFileCompression } from "@/shared/lib/handleFileCompression";
import { cn } from "@/shared/lib/utils";

interface Props {
	helperText?: string;
	selectedImageUrl: string | null;
	setSelectedImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
	selectedFile: File | null;
	setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
	clearImageAddedFunctionality?: () => void;
}

export const StatefulMediaChanger = observer(
	({
		selectedImageUrl,
		setSelectedImageUrl,
		selectedFile,
		setSelectedFile,
		helperText,
		clearImageAddedFunctionality,
	}: Props) => {
		const uiStore = useUIStore();
		const fileInputRef = useRef<HTMLInputElement>(null);

		const [isError, setIsError] = useState(false);
		const [isUploading, setIsUploading] = useState<boolean>(true);
		const [uploadProgress, setUploadProgress] = useState<number>(0);
		const [progressInterval, setProgressInterval] =
			useState<NodeJS.Timeout | null>(null);
		const [isHovered, setIsHovered] = useState(false);

		const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
		const NoImageFile = useNoImage();
		const baseUrl = API_CONFIG.BASE_URL;

		const hasValidImage =
			selectedImageUrl &&
			selectedImageUrl !== null &&
			!selectedImageUrl.endsWith("undefined");

		const startSimulatedProgress = () => {
			setUploadProgress(0);

			const interval = setInterval(() => {
				setUploadProgress((prevProgress) => {
					if (prevProgress >= 95) {
						clearInterval(interval);
						return prevProgress;
					}
					return prevProgress + 5;
				});
			}, 500);
			return interval;
		};

		const handleFileSelection = async (files: FileList) => {
			if (files && files.length > 0) {
				await onFileDrop([files[0]]);
			}
		};

		const onFileDrop = async (acceptedFile: File[]) => {
			handleImageFileCompression({
				acceptedFile: acceptedFile,
				options: {
					acceptedImageTypes,
					maxSizeMB: 3,
					maxWidthOrHeight: 1920,
				},
				callbacks: {
					setIsError,
					setIsUploading,
					setSelectedFile,
					setSelectedImageUrl,
					setUploadProgress,
					setProgressInterval,
					startSimulatedProgress,
				},
				progressInterval,
			});
		};

		const onDeleteEntry = (e: React.MouseEvent) => {
			e.preventDefault();
			setSelectedFile(null);
			setSelectedImageUrl(null);
			setUploadProgress(0);
		};

		const handleFileInputChange = (
			e: React.ChangeEvent<HTMLInputElement>
		) => {
			if (e.target.files && e.target.files.length > 0) {
				handleFileSelection(e.target.files);
			}
		};

		const triggerFileInput = () => {
			if (fileInputRef.current) {
				fileInputRef.current.click();
			}
		};

		useEffect(() => {
			if (isError && progressInterval) {
				clearInterval(progressInterval);
				setUploadProgress(0);
			}
		}, [isError, progressInterval]);

		return (
			<div
				className="relative"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Hidden file input */}
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept={acceptedImageTypes.join(",")}
					onChange={handleFileInputChange}
				/>

				{isHovered && hasValidImage && (
					<button
						className="absolute right-4 top-4 z-[99999] bg-white p-4 rounded-full text-red-500 hover:text-red-400 transition-colors"
						onClick={async (e) => {
							onDeleteEntry(e);
							if (clearImageAddedFunctionality) {
								console.log("Clearing image");
								await clearImageAddedFunctionality();
								console.log("cleared");
							}
						}}
					>
						<ImCross size={25} />
					</button>
				)}

				<Dropzone multiple={false} onDrop={onFileDrop}>
					{({ getRootProps, getInputProps }) => {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { onClick, ...rootProps } = getRootProps();

						return (
							<div
								{...rootProps}
								className={cn(
									"h-72 w-full border border-dashed rounded-lg cursor-pointer",
									uiStore.theme === "light"
										? "border-gray-300"
										: "border-gray-500"
								)}
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
							>
								<input {...getInputProps()} />
								{hasValidImage ? (
									<div className="w-full h-full relative rounded-lg">
										<div className="overflow-hidden w-full h-full rounded-lg">
											<img
												className="rounded-lg object-cover w-full h-full"
												src={
													selectedImageUrl
														? selectedImageUrl?.startsWith(
																"/files"
														  )
															? `${baseUrl}${selectedImageUrl}`
															: selectedImageUrl
														: NoImageFile
												}
												alt="Selected media"
												draggable="false"
											/>
										</div>
									</div>
								) : (
									<div className="flex flex-col justify-center items-center w-full h-full bg-black/80 rounded-lg z-[3]">
										<div className="flex flex-col justify-center items-center">
											<BsCloudArrowUp
												size={50}
												className="text-white"
											/>
										</div>

										<div className="flex flex-col items-center text-center text-white">
											<p className="px-8 text-center">
												{helperText ||
													"Click or drop image here"}
											</p>
										</div>

										{isUploading && (
											<div className="w-full mt-4 max-w-xs mx-auto">
												<div className="w-4/5 h-1 px-1">
													<Progress
														value={uploadProgress}
														className={cn(
															"h-1",
															uploadProgress ===
																100 &&
																selectedFile
																? "bg-green-500"
																: "bg-blue-500",
															uiStore.theme ===
																"light"
																? "bg-gray-200"
																: "bg-gray-900"
														)}
													/>
												</div>
											</div>
										)}

										{isError && (
											<div className="text-center">
												<p className="text-red-500 mt-4">
													That file is not of the
													correct type
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						);
					}}
				</Dropzone>
			</div>
		);
	}
);

StatefulMediaChanger.displayName = "StatefulMediaChanger";
