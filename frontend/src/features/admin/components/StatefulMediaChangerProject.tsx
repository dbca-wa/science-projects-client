import { useNoImage } from "@/shared/hooks/helper/useNoImage";
import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import { BsCloudArrowUp } from "react-icons/bs";
import { FiEdit, FiMaximize, FiSquare } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { MdAspectRatio } from "react-icons/md";
import ReactCrop, {
	type Crop,
	type PixelCrop,
	centerCrop,
	makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { observer } from "mobx-react-lite";
import { API_CONFIG } from "@/shared/services/api/config";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Progress } from "@/shared/components/ui/progress";
import { Slider } from "@/shared/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
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
	projectTitle?: string;
	baseAPI?: string;
}

export const StatefulMediaChangerProject = observer(
	({
		selectedImageUrl,
		setSelectedImageUrl,
		selectedFile,
		setSelectedFile,
		helperText,
		clearImageAddedFunctionality,
		projectTitle,
	}: Props) => {
		const uiStore = useUIStore();
		const fileInputRef = useRef<HTMLInputElement>(null);
		const imgRef = useRef<HTMLImageElement>(null);
		// const previewCanvasRef = useRef<HTMLCanvasElement>(null);

		const [isOpen, setIsOpen] = useState(false);
		const [crop, setCrop] = useState<Crop>({
			unit: "%",
			width: 50,
			height: 50,
			x: 25,
			y: 25,
		});
		const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(
			null
		);
		const [scale, setScale] = useState(1);
		const [rotate, setRotate] = useState(0);
		const [aspect, setAspect] = useState<number | undefined>(16 / 9);

		const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(
			null
		);
		const [originalFile, setOriginalFile] = useState<File | null>(null);

		const [previewUrls, setPreviewUrls] = useState<{
			card: string | null;
		}>({ card: null });

		const [isError, setIsError] = useState(false);
		const [isUploading, setIsUploading] = useState<boolean>(true);
		const [uploadProgress, setUploadProgress] = useState<number>(0);
		const [progressInterval, setProgressInterval] =
			useState<NodeJS.Timeout | null>(null);
		// const [isImageError, setIsImageError] = useState(false);
		const [isHovered, setIsHovered] = useState(false);

		const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
		const NoImageFile = useNoImage();
		const baseUrl = API_CONFIG.BASE_URL;

		const hasValidImage =
			selectedImageUrl &&
			selectedImageUrl !== null &&
			!selectedImageUrl.endsWith("undefined");

		const blobToFile = (blob: Blob, fileName: string): File => {
			return new File([blob], fileName, { type: blob.type });
		};

		const setAspectRatio = useCallback(
			(aspectRatio: number | undefined) => {
				setAspect(aspectRatio);

				if (aspectRatio && imgRef.current) {
					const { width, height } = imgRef.current;
					const imageAspect = width / height;
					let cropWidth = 50;
					let cropHeight = 50;

					if (aspectRatio > imageAspect) {
						cropWidth = 90;
						cropHeight = 90 / aspectRatio;
					} else {
						cropHeight = 90;
						cropWidth = 90 * aspectRatio;
					}

					const newCrop = centerCrop(
						makeAspectCrop(
							{
								unit: "%",
								width: cropWidth,
								height: cropHeight,
							},
							aspectRatio,
							width,
							height
						),
						width,
						height
					);

					setCrop(newCrop);
				}
			},
			[]
		);

		const resetTransforms = () => {
			setScale(1);
			setRotate(0);
		};

		const generateCropPreview = useCallback(
			async (
				image: HTMLImageElement,
				crop: PixelCrop,
				scale = 1,
				rotate = 0
			) => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				if (!ctx) {
					return null;
				}

				const scaleX = image.naturalWidth / image.width;
				const scaleY = image.naturalHeight / image.height;

				const cropWidthNatural = crop.width * scaleX;
				const cropHeightNatural = crop.height * scaleY;

				const scaledWidth = cropWidthNatural;
				const scaledHeight = cropHeightNatural;

				let canvasWidth = scaledWidth;
				let canvasHeight = scaledHeight;

				if (rotate !== 0 && rotate % 360 !== 0) {
					const rotateRads = (rotate * Math.PI) / 180;
					const rotatedWidth =
						Math.abs(Math.cos(rotateRads) * scaledWidth) +
						Math.abs(Math.sin(rotateRads) * scaledHeight);
					const rotatedHeight =
						Math.abs(Math.sin(rotateRads) * scaledWidth) +
						Math.abs(Math.cos(rotateRads) * scaledHeight);

					canvasWidth = rotatedWidth;
					canvasHeight = rotatedHeight;
				}

				const pixelRatio = window.devicePixelRatio || 1;
				canvas.width = canvasWidth * pixelRatio;
				canvas.height = canvasHeight * pixelRatio;

				ctx.scale(pixelRatio, pixelRatio);
				ctx.imageSmoothingQuality = "high";
				ctx.imageSmoothingEnabled = true;

				const cropX = crop.x * scaleX;
				const cropY = crop.y * scaleY;

				ctx.save();

				ctx.translate(canvasWidth / 2, canvasHeight / 2);
				ctx.rotate((rotate * Math.PI) / 180);

				ctx.scale(scale, scale);

				ctx.translate(-scaledWidth / 2, -scaledHeight / 2);

				ctx.drawImage(
					image,
					cropX,
					cropY,
					cropWidthNatural,
					cropHeightNatural,
					0,
					0,
					scaledWidth,
					scaledHeight
				);

				ctx.restore();

				return new Promise<string>((resolve) => {
					canvas.toBlob(
						(blob) => {
							if (!blob) {
								console.error(
									"Canvas to Blob conversion failed"
								);
								return;
							}
							const url = URL.createObjectURL(blob);
							resolve(url);
						},
						"image/jpeg",
						0.95
					);
				});
			},
			[]
		);

		useEffect(() => {
			async function updatePreviews() {
				if (completedCrop && imgRef.current) {
					try {
						const previewUrl = await generateCropPreview(
							imgRef.current,
							completedCrop,
							scale,
							rotate
						);

						if (previewUrl) {
							setPreviewUrls({
								card: previewUrl,
							});
						}
					} catch (error) {
						console.error("Error generating preview:", error);
					}
				}
			}

			updatePreviews();
		}, [completedCrop, scale, rotate, generateCropPreview]);

		const applyCrop = async () => {
			if (!completedCrop || !imgRef.current) return;

			try {
				const croppedImageUrl = await generateCropPreview(
					imgRef.current,
					completedCrop,
					scale,
					rotate
				);

				if (croppedImageUrl) {
					const response = await fetch(croppedImageUrl);
					const blob = await response.blob();

					const croppedFile = blobToFile(
						blob,
						selectedFile
							? selectedFile.name
							: "cropped-project-image.jpg"
					);

					setSelectedFile(croppedFile);
					setSelectedImageUrl(croppedImageUrl);
					setPreviewUrls({ card: null });
					setIsOpen(false);
				}
			} catch (error) {
				console.error("Error applying crop:", error);
			}
		};

		const resetCrop = () => {
			if (originalImageUrl && originalFile) {
				setSelectedImageUrl(originalImageUrl);
				setSelectedFile(originalFile);
			}
			resetTransforms();
			setCrop({
				unit: "%",
				width: 50,
				height: 50,
				x: 25,
				y: 25,
			});
			setCompletedCrop(null);
			setPreviewUrls({ card: null });
		};

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
			setPreviewUrls({ card: null });
			setOriginalFile(null);
			setOriginalImageUrl(null);
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

		const openCropModal = () => {
			setOriginalFile(selectedFile);
			setOriginalImageUrl(selectedImageUrl);

			setCrop({
				unit: "%",
				width: 70,
				height: 70,
				x: 15,
				y: 15,
			});
			resetTransforms();

			setIsOpen(true);
		};

		useEffect(() => {
			if (isError && progressInterval) {
				clearInterval(progressInterval);
				setUploadProgress(0);
			}
		}, [isError, progressInterval]);

		const handleImageLoad = useCallback(() => {
			if (imgRef.current) {
				setTimeout(() => {
					if (imgRef.current) {
						const { width, height } = imgRef.current;

						const defaultAspect = aspect || 16 / 9;

						const initialCrop = makeAspectCrop(
							{
								unit: "%",
								width: 80,
							},
							defaultAspect,
							width,
							height
						);

						const centeredCrop = centerCrop(
							initialCrop,
							width,
							height
						);
						setCrop(centeredCrop);

						const pixelCrop: PixelCrop = {
							unit: "px",
							width: (centeredCrop.width * width) / 100,
							height: (centeredCrop.height * height) / 100,
							x: (centeredCrop.x * width) / 100,
							y: (centeredCrop.y * height) / 100,
						};

						setCompletedCrop(pixelCrop);
					}
				}, 100);
			}
		}, [aspect]);

		return (
			<>
				<div className="flex flex-row w-full gap-6 select-none">
					{hasValidImage && (
						<div className="flex flex-col items-center justify-center min-w-[220px] px-4">
							<div className="text-center">
								<p className="text-sm mb-2 font-medium">
									Project Card Preview:
								</p>
								<div
									className={cn(
										"w-[200px] h-[120px] rounded-lg overflow-hidden border shadow-sm mx-auto",
										uiStore.theme === "light"
											? "border-gray-200 bg-white"
											: "border-gray-600 bg-gray-700"
									)}
								>
									<img
										src={
											selectedImageUrl
												? selectedImageUrl?.startsWith(
														"/files"
												  )
													? `${baseUrl}${selectedImageUrl}`
													: selectedImageUrl
												: NoImageFile
										}
										alt={`Project: ${
											projectTitle || "Project"
										}`}
										className="h-full w-full object-cover"
										// onError={() => setIsImageError(true)}
										draggable="false"
									/>
								</div>

								<p
									className={cn(
										"text-xs mt-2 max-w-[200px] mx-auto text-center italic",
										uiStore.theme === "light"
											? "text-gray-600"
											: "text-gray-400"
									)}
								>
									Photos are dynamic when not printed
								</p>
							</div>
						</div>
					)}

					<div
						className="relative flex-1"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
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
										await clearImageAddedFunctionality();
									}
								}}
							>
								<ImCross size={25} />
							</button>
						)}

						{isHovered && hasValidImage && (
							<button
								className="absolute left-4 top-4 z-[99999] bg-white p-4 rounded-full text-blue-500 hover:text-blue-400 transition-colors"
								onClick={openCropModal}
							>
								<FiEdit size={25} />
							</button>
						)}

						<Dropzone multiple={false} onDrop={onFileDrop}>
							{({ getRootProps, getInputProps }) => {
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								const { onClick, ...rootProps } =
									getRootProps();

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
														alt="Selected project"
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
																value={
																	uploadProgress
																}
																className={cn(
																	"h-1",
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
															That file is not of
															the correct type
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
				</div>

				{/* Crop Modal */}
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogContent
						className={cn(
							"max-w-[90vw] h-[80vh]",
							uiStore.theme === "dark" && "text-gray-400"
						)}
					>
						<DialogHeader>
							<DialogTitle>
								Crop and Adjust Project Image
							</DialogTitle>
						</DialogHeader>

						<div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
							{/* Main crop area */}
							<div
								className={cn(
									"flex-[3] rounded-md relative overflow-hidden flex justify-center items-center",
									uiStore.theme === "light"
										? "bg-gray-100"
										: "bg-gray-700"
								)}
							>
								{selectedImageUrl && (
									<div className="relative w-auto h-auto max-h-full max-w-full flex justify-center items-center">
										<ReactCrop
											crop={crop}
											onChange={(c) => setCrop(c)}
											onComplete={(c) =>
												setCompletedCrop(c)
											}
											aspect={aspect}
											style={{
												maxWidth: "100%",
												maxHeight: "100%",
											}}
										>
											<img
												ref={imgRef}
												alt="Crop me"
												src={
													selectedImageUrl?.startsWith(
														"/files"
													)
														? `${baseUrl}${selectedImageUrl}`
														: selectedImageUrl
												}
												crossOrigin="anonymous"
												style={{
													transform: `scale(${scale}) rotate(${rotate}deg)`,
													transformOrigin:
														"center center",
													userSelect: "none",
													WebkitUserSelect: "none",
													display: "block",
													maxWidth: "100%",
													maxHeight: "70vh",
												}}
												draggable="false"
												onLoad={handleImageLoad}
											/>
										</ReactCrop>
									</div>
								)}
							</div>

							{/* Right side tools and previews */}
							<div className="flex-1 flex flex-col gap-6 overflow-auto pr-2">
								{/* Live preview */}
								{completedCrop && (
									<div>
										<p className="font-medium mb-2">
											Live Preview
										</p>
										<div>
											<p className="text-sm mb-1">
												Project Card:
											</p>
											<div
												className={cn(
													"w-[150px] h-[90px] rounded-lg overflow-hidden border shadow-sm",
													uiStore.theme === "light"
														? "border-gray-200 bg-white"
														: "border-gray-600 bg-gray-700"
												)}
											>
												<img
													src={
														previewUrls.card ||
														NoImageFile
													}
													alt="Project card preview"
													className="h-full w-full object-cover"
													onError={(e) =>
														console.error(
															"Card preview image error:",
															e
														)
													}
													draggable="false"
												/>
											</div>
										</div>
									</div>
								)}

								{/* Aspect ratio tools */}
								<div>
									<p className="font-medium mb-2">
										Aspect Ratio
									</p>
									<TooltipProvider>
										<div className="flex gap-1 mb-4">
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant={
															aspect === undefined
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() =>
															setAspectRatio(
																undefined
															)
														}
													>
														<FiMaximize className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													Free crop
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant={
															aspect === 1
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() =>
															setAspectRatio(1)
														}
													>
														<FiSquare className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													Square (1:1)
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant={
															aspect === 16 / 9
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() =>
															setAspectRatio(
																16 / 9
															)
														}
													>
														<MdAspectRatio className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													Landscape (16:9)
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant={
															aspect === 4 / 3
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() =>
															setAspectRatio(
																4 / 3
															)
														}
													>
														<MdAspectRatio className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													Photo (4:3)
												</TooltipContent>
											</Tooltip>
										</div>
									</TooltipProvider>
								</div>

								{/* Rotation and zoom tools */}
								<div>
									<p className="font-medium mb-2">
										Adjustments
									</p>
									<div className="mb-4">
										<div className="flex items-center justify-between mb-1">
											<p className="text-sm">Zoom</p>
											<Button
												size="sm"
												variant="outline"
												onClick={() => setScale(1)}
											>
												Reset
											</Button>
										</div>
										<Slider
											min={0.5}
											max={3}
											step={0.1}
											value={[scale]}
											onValueChange={(val) =>
												setScale(val[0])
											}
										/>
									</div>

									<div>
										<div className="flex items-center justify-between mb-1">
											<p className="text-sm">Rotate</p>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														setRotate((r) => r - 90)
													}
												>
													<AiOutlineRotateLeft className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														setRotate((r) => r + 90)
													}
												>
													<AiOutlineRotateRight className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => setRotate(0)}
												>
													Reset
												</Button>
											</div>
										</div>
										<Slider
											min={0}
											max={360}
											step={1}
											value={[rotate]}
											onValueChange={(val) =>
												setRotate(val[0])
											}
										/>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={resetCrop} variant="outline">
								Reset
							</Button>
							<Button
								onClick={() => setIsOpen(false)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button onClick={applyCrop}>Apply Changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	}
);

StatefulMediaChangerProject.displayName = "StatefulMediaChangerProject";
