import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { IProjectPlan } from "@/types";
import {
	Box,
	Center,
	Flex,
	Grid,
	Image,
	Progress,
	Text,
	useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { BsCloudArrowUp } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { SaveMethodologyImageButton } from "./SaveMethodologyImageButton";

interface Props {
	refetch: () => void;
	document: IProjectPlan;
	helperText?: string;
	selectedImageUrl: string | null;
	setSelectedImageUrl: React.Dispatch<React.SetStateAction<string>>;
	selectedFile: File | null;
	setSelectedFile: React.Dispatch<React.SetStateAction<File>>;
}

export const MethodologyImage = ({
	refetch,
	document,
	selectedImageUrl,
	setSelectedImageUrl,
	selectedFile,
	setSelectedFile,
	helperText,
}: Props) => {
	const { colorMode } = useColorMode();

	const [isError, setIsError] = useState(false);
	const [isUploading, setIsUploading] = useState<boolean>(true);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [progressInterval, setProgressInterval] = useState(null);

	const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

	const NoImageFile = useNoImage();

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

	const onFileDrop = async (acceptedFile) => {
		setIsError(false);
		setIsUploading(true);
		const newProgressInterval = startSimulatedProgress();
		setProgressInterval(newProgressInterval);

		if (acceptedFile[0].type) {
			if (!acceptedImageTypes.includes(acceptedFile[0].type)) {
				clearInterval(progressInterval);
				setIsError(true);
				return;
			} else {
				setSelectedFile(acceptedFile[0]);
				setSelectedImageUrl(URL.createObjectURL(acceptedFile[0]));
				clearInterval(progressInterval);
				setUploadProgress(100);
			}
		}
	};

	const onDeleteEntry = (e) => {
		e.preventDefault();
		setSelectedFile(null);
		setSelectedImageUrl(null);
		setUploadProgress(0);
	};

	const onDeleteEntryFromServer = () => {
		setSelectedFile(null);
		setSelectedImageUrl(null);
		setUploadProgress(0);
	};

	useEffect(() => {
		if (isError) {
			clearInterval(progressInterval);
			setUploadProgress(0);
		}
	}, [isError, progressInterval]);

	const baseUrl = useApiEndpoint();

	const [isHovered, setIsHovered] = useState(false);

	return (
		<Box pb={6}>
			<Flex
				bg={colorMode === "light" ? "gray.100" : "gray.700"}
				// roundedTop={"8px"}
				roundedTop={20}
			>
				<Flex justifyContent="flex-start" alignItems={"center"}>
					<Text
						// pt={1}
						pl={8}
						// paddingBottom={"12px"}
						my={0}
						py={3}
						fontWeight={"bold"}
						fontSize={"xl"}
					>
						Methodology Image
					</Text>
				</Flex>
				<Flex justifyContent="flex-end" flex={1}>
					<Grid
						pr={8}
						py={2}
						gridTemplateColumns={"repeat(2, 1fr)"}
						gridColumnGap={2}
					>
						<SaveMethodologyImageButton
							refetch={refetch}
							buttonType={"delete"}
							document={document}
							file={selectedFile}
							canSave={true}
							projectPlanPk={document?.pk}
							onDeleteEntry={onDeleteEntryFromServer}
						/>
						<SaveMethodologyImageButton
							refetch={refetch}
							buttonType={
								document?.methodology_image === null
									? "post"
									: "update"
							}
							document={document}
							file={selectedFile}
							canSave={true}
							projectPlanPk={document?.pk}
						/>
					</Grid>
				</Flex>
			</Flex>

			<Box
				pos={"relative"}
				w={"100%"}
				// bg={"gray.100"}
				// rounded={"lg"}
				// roundedBottom={"lg"}
				boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
				bg={colorMode === "light" ? "whiteAlpha.400" : "blackAlpha.400"}
			>
				<Box
					pos={"relative"}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					cursor={isHovered ? "pointer" : undefined}
				>
					{isHovered &&
					selectedImageUrl &&
					!document?.methodology_image ? (
						<Grid
							// flexDir={"column"}
							gridTemplateColumns={"repeat(1, 1fr)"}
							gridRowGap={"10px"}
							right={4}
							top={4}
							pos={"absolute"}
						>
							<Box
								bg={"white"}
								padding={2}
								rounded={"full"}
								color={isHovered ? "red.500" : "green.500"}
								_hover={{ color: "red.400" }}
								onClick={(e) => {
									onDeleteEntry(e);
								}}
								zIndex={99999}
							>
								<ImCross size={"25px"} />
							</Box>
						</Grid>
					) : null}

					<Dropzone multiple={false} onDrop={onFileDrop}>
						{({ getRootProps }) => (
							<Box
								{...getRootProps()}
								h={72}
								width={"100%"}
								// border={"1px dashed"}
								borderColor={
									colorMode === "light"
										? "gray.300"
										: "gray.500"
								}
								// rounded={"lg"}
								roundedBottom={"lg"}
							>
								{selectedImageUrl &&
								selectedImageUrl !== undefined ? (
									<Box
										w={"100%"}
										h={"100%"}
										pos={"relative"}
										// rounded={"lg"}
										roundedBottom={"lg"}
									>
										<Box
											overflow={"hidden"}
											w={"100%"}
											h={"100%"}
											// rounded={"lg"}
											roundedBottom={"lg"}
										>
											<Image
												// rounded={"lg"}
												roundedBottom={"lg"}
												src={
													selectedImageUrl
														? selectedImageUrl?.startsWith(
																"/files"
															)
															? `${baseUrl}${selectedImageUrl}`
															: selectedImageUrl
														: NoImageFile
												}
												objectFit={"cover"}
												w={"100%"}
												h={"100%"}
											/>
										</Box>
									</Box>
								) : (
									<Flex
										// rounded={"lg"}
										roundedBottom={"lg"}
										flexDir={"column"}
										justifyContent={"center"}
										justifyItems={"center"}
										w={"100%"}
										h={"100%"}
										background={"blackAlpha.800"}
										zIndex={3}
									>
										<Center
											flexDir={"column"}
											justifyContent={"center"}
											justifyItems={"center"}
										>
											<BsCloudArrowUp
												size={"50px"}
												color={"white"}
											/>
										</Center>

										<Grid
											flexDir={"column"}
											alignItems={"center"}
											textAlign={"center"}
											color={"white"}
										>
											<Text px={8} textAlign={"center"}>
												{`${helperText}`}
											</Text>
										</Grid>

										{isUploading ? (
											<Center
												w={"100%"}
												mt={4}
												maxW={"xs"}
												mx={"auto"}
											>
												<Box w={"80%"} h={1} px={1}>
													<Progress
														bg={
															colorMode ===
															"light"
																? "gray.200"
																: "gray.900"
														}
														colorScheme={
															uploadProgress ===
																100 &&
															selectedFile
																? "green"
																: "blue"
														}
														// isIndeterminate
														size={"xs"}
														value={uploadProgress}
														// hasStripe
														// animation={"step-start"}
														//
													/>
												</Box>
											</Center>
										) : null}

										{isError ? (
											<Center>
												<Text color={"red.500"} mt={4}>
													That file is not of the
													correct type
												</Text>
											</Center>
										) : null}
									</Flex>
								)}
							</Box>
						)}
					</Dropzone>
				</Box>
			</Box>
		</Box>
	);
};
