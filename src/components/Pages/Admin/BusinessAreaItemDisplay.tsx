import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { useGetDivisions } from "@/lib/hooks/tanstack/useGetDivisions";
import {
	Box,
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerOverlay,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	Image,
	Input,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Skeleton,
	Text,
	VStack,
	useColorMode,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcOk } from "react-icons/fc";
import { ImCross } from "react-icons/im";
import { MdMoreVert } from "react-icons/md";
import {
	activateBusinessArea,
	deleteBusinessArea,
	updateBusinessArea,
} from "../../../lib/api";
import useApiEndpoint from "../../../lib/hooks/helper/useApiEndpoint";
import useDistilledHtml from "../../../lib/hooks/helper/useDistilledHtml";
import { useNoImage } from "../../../lib/hooks/helper/useNoImage";
import { useFullUserByPk } from "../../../lib/hooks/tanstack/useFullUserByPk";
import {
	BusinessAreaImage,
	IBusinessArea,
	IBusinessAreaUpdate,
} from "../../../types";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { TextButtonFlex } from "../../TextButtonFlex";
import { UserProfile } from "../Users/UserProfile";
import { StatefulMediaChanger } from "./StatefulMediaChanger";

export const BusinessAreaItemDisplay = ({
	pk,
	slug,
	name,
	division,
	leader,
	is_active,
	finance_admin,
	data_custodian,
	focus,
	introduction,
	image,
}: IBusinessArea) => {
	const { register, handleSubmit } = useForm<IBusinessAreaUpdate>();
	const toast = useToast();
	const {
		isOpen: isDeleteModalOpen,
		onOpen: onDeleteModalOpen,
		onClose: onDeleteModalClose,
	} = useDisclosure();
	const {
		isOpen: isUpdateModalOpen,
		onOpen: onUpdateModalOpen,
		onClose: onUpdateModalClose,
	} = useDisclosure();

	const {
		isOpen: isActiveModalOpen,
		onOpen: onActiveModalOpen,
		onClose: onActiveModalClose,
	} = useDisclosure();

	const queryClient = useQueryClient();

	const { userLoading: leaderLoading, userData: leaderData } =
		useFullUserByPk(leader);
	const { userLoading: financeAdminLoading, userData: financeAdminData } =
		useFullUserByPk(finance_admin);
	const { userLoading: dataCustodianLoading, userData: dataCustodianData } =
		useFullUserByPk(data_custodian);

	const NoImageFile = useNoImage();
	const apiEndpoint = useApiEndpoint();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
		(image as BusinessAreaImage)?.file
			? `${(image as BusinessAreaImage).file}`
			: null
	);

	const distlledTitle = useDistilledHtml(name);

	// console.log(image.file)
	const updateMutation = useMutation({
		mutationFn: updateBusinessArea,
		onSuccess: () => {
			// console.log("success")
			toast({
				status: "success",
				title: "Updated",
				position: "top-right",
			});
			queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
			onUpdateModalClose();
		},
		onError: () => {
			// console.log("error")
			toast({
				status: "error",
				title: "Failed",
				position: "top-right",
			});
		},
		onMutate: () => {
			// console.log("attempting update private")
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteBusinessArea,
		onSuccess: () => {
			// console.log("success")
			toast({
				status: "success",
				title: "Deleted",
				position: "top-right",
			});
			onDeleteModalClose();
			queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
		},
		onError: () => {
			// console.log("error")
		},
		onMutate: () => {
			// console.log("mutation")
		},
	});

	const deleteBtnClicked = () => {
		deleteMutation.mutate(pk);
	};

	const activateMutation = useMutation({
		mutationFn: activateBusinessArea,
		onSuccess: () => {
			// console.log("success")
			toast({
				status: "success",
				title: is_active ? "Deactivated" : "Activated",
				position: "top-right",
			});
			onActiveModalClose();
			queryClient.invalidateQueries({ queryKey: ["businessAreas"] });
		},
		onError: () => {
			// console.log("error")
		},
		onMutate: () => {
			// console.log("mutation")
		},
	});

	const activateButtonClicked = () => {
		activateMutation.mutate(pk);
	};

	const onUpdateSubmit = (formData: IBusinessAreaUpdate) => {
		// console.log(formData);

		const {
			pk,
			agency,
			is_active,
			old_id,
			name,
			slug,
			leader,
			data_custodian,
			finance_admin,
			focus,
			introduction,
		} = formData;
		const image = selectedFile;

		// console.log(baDivision)

		const payload = {
			pk,
			agency,
			is_active,
			old_id,
			name,
			slug,
			leader,
			data_custodian,
			finance_admin,
			focus,
			introduction,
			image,
			selectedImageUrl,
			division: baDivision,
		};
		// console.log(payload)
		// Create an object to pass as a single argument to mutation.mutate
		if (!selectedFile) {
			console.log("WITHOUT IMAGE:", payload);
		} else {
			console.log("WITH IMAGE:", payload);
		}
		// console.log(selectedImageUrl);

		updateMutation.mutate(payload);
	};

	const {
		isOpen: isLeaderOpen,
		onOpen: onLeaderOpen,
		onClose: onLeaderClose,
	} = useDisclosure();
	const {
		isOpen: isDataCustodianOpen,
		onOpen: onDataCustodianOpen,
		onClose: onDataCustodianClose,
	} = useDisclosure();
	const {
		isOpen: isFinanceAdminOpen,
		onOpen: onFinanceAdminOpen,
		onClose: onFinanceAdminClose,
	} = useDisclosure();
	const leaderDrawerFunction = () => {
		// console.log(`${leaderData?.first_name} clicked`);
		onLeaderOpen();
	};
	const financeAdminDrawerFunction = () => {
		// console.log(`${financeAdminData?.first_name} clicked`);
		onFinanceAdminOpen();
	};
	const dataCustodianDrawerFunction = () => {
		// console.log(`${dataCustodianData?.first_name} clicked`);
		onDataCustodianOpen();
	};

	const [selectedLeader, setSelectedLeader] = useState<number>();
	const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
	const [selectedDataCustodian, setSelectedDataCustodian] =
		useState<number>();
	// const nameData = watch("name");
	// const slugData = watch('slug');
	// const focusData = watch("focus");
	// const introductionData = watch("introduction");
	// const imageData = watch("image");

	const { colorMode } = useColorMode();

	const [nameData, setNameData] = useState(name);
	const [focusData, setFocusData] = useState(focus);
	const [introductionData, setIntroductionData] = useState(introduction);

	const { divsLoading, divsData } = useGetDivisions();

	const [baDivision, setBaDivision] = useState<number>(division.pk);

	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<>
			{!leaderLoading && leaderData ? (
				<Drawer
					isOpen={isLeaderOpen}
					placement="right"
					onClose={onLeaderClose}
					size={"sm"}
				>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerBody>
							<UserProfile pk={leader} />
						</DrawerBody>
						<DrawerFooter></DrawerFooter>
					</DrawerContent>
				</Drawer>
			) : null}

			{!dataCustodianLoading &&
				dataCustodianData !== null &&
				dataCustodianData !== undefined && (
					<Drawer
						isOpen={isDataCustodianOpen}
						placement="right"
						onClose={onDataCustodianClose}
						size={"sm"} //by default is xs
					>
						<DrawerOverlay />
						<DrawerContent>
							<DrawerBody>
								<UserProfile pk={data_custodian} />
							</DrawerBody>

							<DrawerFooter></DrawerFooter>
						</DrawerContent>
					</Drawer>
				)}

			{!financeAdminLoading &&
				financeAdminData !== null &&
				financeAdminData !== undefined && (
					<Drawer
						isOpen={isFinanceAdminOpen}
						placement="right"
						onClose={onFinanceAdminClose}
						size={"sm"} //by default is xs
					>
						<DrawerOverlay />
						<DrawerContent>
							<DrawerBody>
								<UserProfile pk={finance_admin} />
							</DrawerBody>

							<DrawerFooter></DrawerFooter>
						</DrawerContent>
					</Drawer>
				)}

			<Grid
				gridTemplateColumns="2fr 4fr 3fr 3fr 3fr 1fr"
				// gridTemplateColumns="2fr 2fr 3fr 2fr 2fr 2fr 1fr"
				width="100%"
				p={3}
				borderWidth={1}
				// bg={"red"}
			>
				<Flex
					justifyContent="flex-start"
					alignItems={"center"}
					pos={"relative"}
				>
					{name ? (
						<Skeleton
							isLoaded={imageLoaded}
							rounded="lg"
							// overflow="hidden"
							w="80px"
							h="69px"
							pos={"relative"}
							cursor={"pointer"}
							style={{ transformStyle: "preserve-3d" }}
							boxShadow="0px 10px 15px -5px rgba(0, 0, 0, 0.3), 0px 2px 2.5px -1px rgba(0, 0, 0, 0.06), -1.5px 0px 5px -1px rgba(0, 0, 0, 0.1), 1.5px 0px 5px -1px rgba(0, 0, 0, 0.1)"
							border={
								colorMode === "dark" ? "1px solid" : undefined
							}
							borderColor={"gray.700"}
						>
							<Box
								rounded="lg"
								// overflow="hidden"
								w="80px"
								h="69px"
								pos={"relative"}
							>
								<Image
									onLoad={() => setImageLoaded(true)}
									src={
										image instanceof File
											? `${apiEndpoint}${image.name}` // Use the image directly for File
											: image?.file
												? `${apiEndpoint}${image.file}`
												: NoImageFile
									}
									rounded="lg"
									width={"100%"}
									height={"100%"}
									objectFit={"cover"}
									filter={
										!is_active
											? "grayscale(100%)"
											: undefined
									}
								/>
								<Box
									pos={"absolute"}
									bottom={-1}
									right={-1}
									color={"red"}
								>
									{is_active ? (
										<FcOk size={"24px"} />
									) : (
										<ImCross size={"18px"} />
									)}
								</Box>
							</Box>
						</Skeleton>
					) : (
						<Skeleton
							rounded="lg"
							overflow="hidden"
							w="80px"
							h="69px"
						/>
					)}
				</Flex>
				{/* <Box>{is_active ? "Active" : "Inactive"}</Box> */}
				<TextButtonFlex
					// name={name}
					name={`${distlledTitle} ${!is_active ? "(Inactive)" : ""}`}
					onClick={onUpdateModalOpen}
				/>
				<TextButtonFlex
					name={
						leaderData
							? `${leaderData.first_name} ${leaderData.last_name}`
							: "-"
					}
					onClick={leaderDrawerFunction}
				/>

				{!financeAdminLoading && financeAdminData ? (
					<TextButtonFlex
						name={
							financeAdminData
								? `${financeAdminData.first_name} ${financeAdminData.last_name}`
								: "-"
						}
						onClick={financeAdminDrawerFunction}
					/>
				) : (
					<TextButtonFlex />
				)}

				{!dataCustodianLoading && dataCustodianData ? (
					<TextButtonFlex
						name={
							dataCustodianData
								? `${dataCustodianData.first_name} ${dataCustodianData.last_name}`
								: "-"
						}
						onClick={dataCustodianDrawerFunction}
					/>
				) : (
					<TextButtonFlex />
				)}

				<Flex justifyContent="flex-end" mr={2} alignItems={"center"}>
					<Menu>
						<MenuButton
							px={2}
							py={2}
							transition="all 0.2s"
							rounded={4}
							borderRadius="md"
							borderWidth="1px"
							_hover={{ bg: "gray.400" }}
							_expanded={{ bg: "blue.400" }}
							_focus={{ boxShadow: "outline" }}
						>
							<Flex
								alignItems={"center"}
								justifyContent={"center"}
							>
								<MdMoreVert />
							</Flex>
						</MenuButton>
						<MenuList>
							<MenuItem onClick={onUpdateModalOpen}>
								Edit
							</MenuItem>
							<MenuItem onClick={onActiveModalOpen}>
								Change Active Status
							</MenuItem>
							<MenuItem onClick={onDeleteModalOpen}>
								Delete
							</MenuItem>
						</MenuList>
					</Menu>
					{/* </Button> */}
				</Flex>
			</Grid>
			<Modal isOpen={isActiveModalOpen} onClose={onActiveModalClose}>
				<ModalOverlay />
				<ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
					<ModalHeader>
						{is_active
							? "Deactivate Business Area?"
							: "Activate Business Area"}
					</ModalHeader>
					<ModalBody>
						<Box>
							<Text fontSize="lg" fontWeight="semibold">
								Are you sure you want to{" "}
								{is_active ? "deactivate" : "activate"} this
								business area?
							</Text>

							<Text
								fontSize="lg"
								fontWeight="semibold"
								color={"blue.500"}
								mt={4}
							>
								"{name}"
							</Text>
						</Box>
					</ModalBody>
					<ModalFooter justifyContent="flex-end">
						<Flex>
							<Button
								onClick={onActiveModalClose}
								colorScheme={"gray"}
							>
								No
							</Button>
							<Button
								onClick={activateButtonClicked}
								color={"white"}
								background={
									colorMode === "light"
										? "green.500"
										: "green.600"
								}
								_hover={{
									background:
										colorMode === "light"
											? "green.400"
											: "green.500",
								}}
								ml={3}
							>
								Yes
							</Button>
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
				<ModalOverlay />
				<ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
					<ModalHeader>Delete Business Area</ModalHeader>
					<ModalBody>
						<Box>
							<Text fontSize="lg" fontWeight="semibold">
								Are you sure you want to delete this business
								area?
							</Text>

							<Text
								fontSize="lg"
								fontWeight="semibold"
								color={"blue.500"}
								mt={4}
							>
								"{name}"
							</Text>
						</Box>
					</ModalBody>
					<ModalFooter justifyContent="flex-end">
						<Flex>
							<Button
								onClick={onDeleteModalClose}
								colorScheme={"gray"}
							>
								No
							</Button>
							<Button
								onClick={deleteBtnClicked}
								color={"white"}
								background={
									colorMode === "light"
										? "red.500"
										: "red.600"
								}
								_hover={{
									background:
										colorMode === "light"
											? "red.400"
											: "red.500",
								}}
								ml={3}
							>
								Yes
							</Button>
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal
				isOpen={isUpdateModalOpen}
				onClose={onUpdateModalClose}
				size={"4xl"}
				scrollBehavior="outside"
			>
				<ModalOverlay />
				<ModalHeader>Update Business Area</ModalHeader>
				<ModalBody>
					<ModalContent
						bg={colorMode === "light" ? "white" : "gray.800"}
						p={4}
						px={6}
					>
						<FormControl>
							{/* Hidden input to capture the pk */}
							<input
								type="hidden"
								{...register("pk")}
								defaultValue={pk} // Prefill with the 'pk' prop
							/>
						</FormControl>
						<FormControl>
							{/* Hidden input to capture the slug */}
							<input
								type="hidden"
								{...register("slug")}
								defaultValue={slug} // Prefill with the 'pk' prop
							/>
						</FormControl>
						<VStack
							spacing={3}
							as="form"
							id="update-form"
							onSubmit={handleSubmit(onUpdateSubmit)}
						>
							<FormControl mb={2}>
								<FormLabel>Name</FormLabel>
								<Input
									autoFocus
									autoComplete="off"
									value={nameData}
									onChange={(e) =>
										setNameData(e.target.value)
									}
									// {...register("name", { required: true })}
								/>
							</FormControl>

							{!divsLoading && divsData && baDivision ? (
								<FormControl mb={2}>
									<FormLabel>Division</FormLabel>
									<Select
										value={baDivision}
										// defaultValue={baDivision}
										onChange={(e) => {
											setBaDivision(
												Number(e.target.value)
											);
											// console.log(division)
											// const selectedDivision = divsData.find(
											//   (div) => div.id === Number(e.target.value)
											// );
											// if (selectedDivision) {
											//   setBaDivision(selectedDivision?.pk);
											// }
										}}
									>
										{divsData?.map((div) => (
											<option key={div.pk} value={div.pk}>
												{div.name}
											</option>
										))}
									</Select>
									<FormHelperText>
										The division the business area belongs
										to
									</FormHelperText>
								</FormControl>
							) : null}

							{/* <UnboundStatefulEditor
                title="Business Area Name"
                helperText={"Name of Business Area"}
                showToolbar={false}
                showTitle={true}
                isRequired={true}
                value={nameData}
                setValueFunction={setNameData}
                setValueAsPlainText={false}
              /> */}
							<UnboundStatefulEditor
								title="Introduction"
								helperText={
									"A description of the Business Area"
								}
								showToolbar={true}
								showTitle={true}
								isRequired={true}
								value={introductionData}
								setValueFunction={setIntroductionData}
								setValueAsPlainText={false}
							/>

							<UnboundStatefulEditor
								title="Focus"
								helperText={
									"Primary concerns of the Business Area"
								}
								showToolbar={true}
								showTitle={true}
								isRequired={true}
								value={focusData}
								setValueFunction={setFocusData}
								setValueAsPlainText={false}
							/>

							<FormControl isRequired pb={4}>
								<FormLabel ml={2}>Image</FormLabel>
								<StatefulMediaChanger
									helperText="Drag and drop an image for the Business Area"
									selectedFile={selectedFile}
									setSelectedFile={setSelectedFile}
									selectedImageUrl={selectedImageUrl}
									setSelectedImageUrl={setSelectedImageUrl}
								/>
							</FormControl>

							<FormControl mt={3} ml={2}>
								<UserSearchDropdown
									{...register("leader", { required: true })}
									onlyInternal={true}
									isRequired={false}
									setUserFunction={setSelectedLeader}
									preselectedUserPk={leader}
									isEditable
									label="Leader"
									placeholder="Search for a user"
									helperText={
										"The Leader of the business area."
									}
								/>
							</FormControl>

							<FormControl ml={2}>
								<UserSearchDropdown
									{...register("finance_admin", {
										required: true,
									})}
									onlyInternal={true}
									isRequired={false}
									setUserFunction={setSelectedFinanceAdmin}
									preselectedUserPk={finance_admin}
									isEditable
									label="Finance Admin"
									placeholder="Search for a user"
									helperText={
										"The Finance Admin of the business area."
									}
								/>
							</FormControl>
							<FormControl ml={2}>
								<UserSearchDropdown
									{...register("data_custodian", {
										required: true,
									})}
									onlyInternal={true}
									isRequired={false}
									setUserFunction={setSelectedDataCustodian}
									preselectedUserPk={data_custodian}
									isEditable
									label="Data Custodian"
									placeholder="Search for a user"
									helperText={
										"The Data Custodian of the business area."
									}
								/>
							</FormControl>
							{updateMutation.isError ? (
								<Text color={"red.500"}>
									Something went wrong
								</Text>
							) : null}
						</VStack>
						<Grid
							mt={10}
							w={"100%"}
							justifyContent={"end"}
							gridTemplateColumns={"repeat(2, 1fr)"}
							gridGap={4}
						>
							<Button onClick={onUpdateModalClose} size="lg">
								Cancel
							</Button>
							<Button
								// form="update-form"
								// type="submit"
								isLoading={updateMutation.isPending}
								color={"white"}
								background={
									colorMode === "light"
										? "blue.500"
										: "blue.600"
								}
								_hover={{
									background:
										colorMode === "light"
											? "blue.400"
											: "blue.500",
								}}
								size="lg"
								onClick={() => {
									onUpdateSubmit({
										pk: pk,
										agency: 1,
										is_active: is_active,
										old_id: 1,
										name: nameData,
										slug: slug,
										leader: selectedLeader,
										data_custodian: selectedDataCustodian,
										finance_admin: selectedFinanceAdmin,
										focus: focusData,
										introduction: introductionData,
										image: selectedFile,
									});
								}}
							>
								Update
							</Button>
						</Grid>
					</ModalContent>
				</ModalBody>
			</Modal>
		</>
	);
};
