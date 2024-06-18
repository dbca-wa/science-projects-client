import { AddDBCAUserModal } from "@/components/Modals/Admin/AddDBCAUserModal";
import { ProjectLeadEmailModal } from "@/components/Modals/ProjectLeadEmailModal";
import {
	Box,
	Button,
	Divider,
	Grid,
	Text,
	useColorMode,
	useDisclosure,
} from "@chakra-ui/react";

export const AdminDataLists = () => {
	const { colorMode } = useColorMode();

	const {
		isOpen: isAddDBCAUserModalOpen,
		onOpen: onOpenAddDBCAUserModal,
		onClose: onCloseAddDBCAUserModal,
	} = useDisclosure();

	return (
		<>
			{/* Modals */}
			<AddDBCAUserModal
				isOpen={isAddDBCAUserModalOpen}
				onClose={onCloseAddDBCAUserModal}
			/>
			{/* Other */}
			<Box mt={8} mb={4}>
				<Text fontWeight={"semibold"} mb={3}>
					Users (Actions)
				</Text>
				<Divider />
			</Box>

			<Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
				<Button
					bg={colorMode === "light" ? "blue.500" : "blue.600"}
					color={"white"}
					_hover={{
						bg: colorMode === "light" ? "blue.400" : "blue.500",
					}}
					onClick={onOpenAddDBCAUserModal}
				>
					Add a DBCA User
				</Button>
				{/*  
          Adding an internal DBCA member who won't visit the site but needs accreditation somehow.
        */}
				<Button
					bg={colorMode === "light" ? "orange.600" : "orange.700"}
					color={"white"}
					_hover={{
						bg: colorMode === "light" ? "orange.500" : "orange.600",
					}}
				>
					Set Caretaker
				</Button>
				{/* 
          For users who are on leave.
        */}
			</Grid>
		</>
	);
};

// const {
//   isOpen: isProjectLeadEmailModalOpen,
//   onOpen: onProjectLeadEmailModalOpen,
//   onClose: onProjectLeadEmailModalClose,
// } = useDisclosure();

// <ProjectLeadEmailModal
// isOpen={isProjectLeadEmailModalOpen}
// onClose={onProjectLeadEmailModalClose}
// />
// <Box mb={4}>
// <Text fontWeight={"semibold"} mb={3}>
//   Projects & Leaders Lists (View)
// </Text>
// <Divider />
// </Box>

// <Grid gridTemplateColumns={"repeat(4, 1fr)"} gridGap={4}>
// <Button onClick={onProjectLeadEmailModalOpen}>
//   Active Project Lead Emails
// </Button>
// <Button>Projects with Multiple Lead Tags</Button>
// <Button>Projects with External Leads</Button>
// <Button>Projects with No Lead Tags</Button>
// <Button>Projects with No Members</Button>
// </Grid>

// <Box mt={8} mb={4}>
// <Text fontWeight={"semibold"} mb={3}>
//   Projects & Leaders List (Actions)
// </Text>
// <Divider />
// </Box>

// <Grid gridTemplateColumns={"repeat(4, 1fr)"} gridGap={4}>
// <Button>Ensure Only One Leader</Button>
// {/*
//   If two users with Leader tag, select the one with is_leader to retain it,
//   the others get converted to Science Support (internal) or Consulted Peer (external).
// */}
// <Button>Set Leaders to have Tag</Button>
// {/*
//   Checks to see leaders (is_leader) who do not have the tag and converts them to have the tag, removes tag from all others in project
//   and replaces them with science support (internal) or consulted peer (external)
// */}
// </Grid>
