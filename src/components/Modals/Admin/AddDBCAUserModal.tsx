// Modal version of CreateUser component

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	useColorMode,
	useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInternalUser } from "./CreateInternalUser";

interface IAddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AddDBCAUserModal = ({ isOpen, onClose }: IAddUserModalProps) => {
	const { colorMode } = useColorMode();
	const {
		isOpen: isToastOpen,
		// onOpen: openToast,
		onClose: closeToast,
	} = useDisclosure();

	useEffect(() => {
		if (isToastOpen) {
			onClose();
		}
	}, [isToastOpen, onClose]);

	const handleToastClose = () => {
		closeToast();
		onClose();
	};

	const navigate = useNavigate();

	return (
		<Modal isOpen={isOpen} onClose={handleToastClose} size={"3xl"}>
			<ModalOverlay />
			<ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
				<ModalHeader>Add DBCA User</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{/* <CreateUser onSuccess={openToast} isModal={true} /> */}
					<CreateInternalUser
						isModal
						onClose={handleToastClose}
						onSuccess={() => navigate("/users")}
					/>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
