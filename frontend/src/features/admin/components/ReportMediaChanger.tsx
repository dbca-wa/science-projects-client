import { handleImageFileCompression } from "@/shared/lib/handleFileCompression";
import { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { observer } from "mobx-react-lite";
import { API_CONFIG } from "@/shared/services/api/config";
import { Progress } from "@/shared/components/ui/progress";
import { useUIStore } from "@/app/stores/useStore";
import { cn } from "@/shared/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	deleteReportMediaImage,
	uploadReportMediaImage,
} from "../services/admin.service";

interface Props {
	section:
		| "cover"
		| "rear_cover"
		| "sdchart"
		| "service_delivery"
		| "research"
		| "partnerships"
		| "collaborations"
		| "student_projects"
		| "publications"
		| "dbca_banner"
		| "dbca_banner_cropped";
	helperText?: string;
	reportMediaData: Array<{ kind: string; file: string }>;
	reportPk: number;
	refetchData: () => void;
}

const titleDictionary: Record<Props["section"], string> = {
	cover: "Cover Page",
	sdchart: "Service Delivery Org Chart",
	service_delivery: "Service Delivery Chapter Image",
	research: "Research Chapter Image",
	partnerships: "Partnerships Chapter Image",
	collaborations: "Collaborations Chapter Image",
	student_projects: "Student Projects Chapter Image",
	publications: "Publications Chapter Image",
	rear_cover: "Rear Cover Page",
	dbca_banner: "DBCA Banner (bottom of front page)",
	dbca_banner_cropped: "Header of main pages next to year",
};

export const ReportMediaChanger = observer(
	({ reportMediaData, section, reportPk, refetchData }: Props) => {
		const uiStore = useUIStore();
		const queryClient = useQueryClient();

		const [uploadedFile, setUploadedFile] = useState<File | null>(null);
		const [isError, setIsError] = useState(false);
		const [isUploading, setIsUploading] = useState<boolean>(true);
		const [uploadProgress, setUploadProgress] = useState<number>(0);
		const [progressInterval, setProgressInterval] =
			useState<NodeJS.Timeout | null>(null);
		const [selectedFile, setSelectedFile] = useState<File | null>(null);
		const [isHovered, setIsHovered] = useState(false);

		const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
		const baseUrl = API_CONFIG.BASE_URL;

		const [currentImage, setCurrentImage] = useState<string | null>(() => {
			const matches = reportMediaData.filter((i) => i.kind === section);
			if (matches.length < 1) {
				return null;
			} else {
				return matches[0].file;
			}
		});

		const toastIdRef = useRef<string | number | undefined>(undefined);

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

		const onFileDrop = async (acceptedFile: File[]) => {
			if (acceptedFile[0].type) {
				if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
					setIsError(true);
					return;
				} else {
					try {
						const fileData = await handleImageFileCompression({
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
								setSelectedImageUrl: setCurrentImage,
								setUploadProgress,
								setProgressInterval,
								startSimulatedProgress,
							},
							progressInterval,
						});

						if (fileData) {
							const mutationData = {
								file: fileData,
								section: section,
								pk: reportPk,
							};
							fileDropMutation.mutate(mutationData);
						}
					} catch (error) {
						console.error("Error during image compression:", error);
						return;
					}
				}
			}
		};

		const onDeleteEntry = (e: React.MouseEvent) => {
			e.preventDefault();
			const data = {
				pk: reportPk,
				section: section,
			};
			deleteImageMutation.mutate(data);
		};

		const fileDropMutation = useMutation({
			mutationFn: uploadReportMediaImage,
			onMutate: (mutationData) => {
				setIsError(false);
				setIsUploading(true);
				const newProgressInterval = startSimulatedProgress();
				setProgressInterval(newProgressInterval);

				toastIdRef.current = toast.loading("Uploading image...");

				return mutationData;
			},
			onSuccess: async (data, mutationData) => {
				if (toastIdRef.current) {
					toast.success("Image uploaded successfully", {
						id: toastIdRef.current,
					});
				}
				setUploadedFile(mutationData.file);
				setCurrentImage(URL.createObjectURL(mutationData.file));

				setTimeout(async () => {
					if (progressInterval) {
						clearInterval(progressInterval);
					}
					setUploadProgress(100);

					queryClient.invalidateQueries({
						queryKey: ["reportMedia", mutationData.pk],
					});

					await refetchData();
				}, 350);
			},
			onError: (error) => {
				if (toastIdRef.current) {
					toast.error(`Could not upload image: ${error}`, {
						id: toastIdRef.current,
					});
				}
				if (progressInterval) {
					clearInterval(progressInterval);
				}
				setUploadProgress(0);
			},
		});

		const deleteImageMutation = useMutation({
			mutationFn: deleteReportMediaImage,
			onMutate: () => {
				toastIdRef.current = toast.loading("Deleting file...");
			},
			onSuccess: async () => {
				if (toastIdRef.current) {
					toast.success("Image deleted successfully", {
						id: toastIdRef.current,
					});
				}
				setUploadedFile(null);
				setCurrentImage(null);
				setUploadProgress(0);

				setTimeout(async () => {
					queryClient.invalidateQueries({
						queryKey: ["reportMedia", reportPk],
					});
					await refetchData();
				}, 350);
			},
			onError: (error) => {
				if (toastIdRef.current) {
					toast.error(`Could not delete image: ${error}`, {
						id: toastIdRef.current,
					});
				}
			},
		});

		return (
			<div
				className="h-[400px] relative"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{isHovered && (currentImage || uploadedFile) && (
					<button
						className="absolute right-4 bottom-4 z-[99999] text-red-500 hover:text-red-400 transition-colors"
						onClick={(e) => {
							onDeleteEntry(e);
						}}
					>
						<ImCross size={25} />
					</button>
				)}

				<Dropzone multiple={false} onDrop={onFileDrop}>
					{({ getRootProps, getInputProps, acceptedFiles }) => (
						<div
							{...getRootProps()}
							className={cn(
								"h-[400px] w-full border border-dashed rounded-lg cursor-pointer",
								uiStore.theme === "light"
									? "bg-gray-100 border-gray-300"
									: "bg-gray-700 border-gray-500"
							)}
						>
							<input {...getInputProps()} />
							{((acceptedFiles &&
								!isError &&
								currentImage !== null &&
								acceptedFiles[0] instanceof File) ||
								currentImage !== null) && (
								<div className="w-full h-full relative rounded-lg">
									<div className="absolute bottom-0 w-full py-4 px-4 bg-black/80 rounded-b-lg text-center z-[99]">
										<p className="text-white">
											{titleDictionary[section]}
										</p>
									</div>

									<div className="overflow-hidden w-full h-full rounded-lg">
										<img
											className="rounded-lg object-cover w-full h-full"
											src={
												acceptedFiles &&
												!isError &&
												currentImage !== null &&
												selectedFile instanceof File
													? URL.createObjectURL(
															selectedFile
													  )
													: currentImage &&
													  currentImage !== null
													? `${baseUrl}${currentImage}`
													: undefined
											}
											alt={titleDictionary[section]}
											draggable="false"
										/>
									</div>
								</div>
							)}

							{!currentImage && (
								<div className="flex flex-col justify-center items-center w-full h-full bg-black/80 rounded-lg z-[3]">
									<div className="flex flex-col justify-center items-center">
										<BsCloudArrowUp
											size={50}
											className="text-white"
										/>
									</div>

									<div className="flex flex-col items-center text-center text-white">
										<p className="px-8 text-center">
											Drag and drop an image for the
										</p>
										<p className="font-semibold">
											{titleDictionary[section]}
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
															100 && uploadedFile
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
										<p className="text-red-500 mt-4">
											That file is not of the correct type
										</p>
									)}
								</div>
							)}
						</div>
					)}
				</Dropzone>
			</div>
		);
	}
);

ReportMediaChanger.displayName = "ReportMediaChanger";
