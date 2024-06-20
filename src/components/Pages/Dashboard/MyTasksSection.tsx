// Component for displaying the tasks the user has on the dashboard (modern)

import {
	AbsoluteCenter,
	Box,
	Divider,
	Flex,
	Grid,
	Heading,
	Text,
	useColorMode,
} from "@chakra-ui/react";
// import { TaskDisplayCard } from "./TaskDisplayCard"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IMainDoc, ITaskDisplayCard } from "../../../types";
import { ModernDocumentTaskDisplayCard } from "./ModernDocumentTaskDisplayCard";
import { ModernEndorsementTaskDisplayCard } from "./ModernEndorsementTaskDisplayCard";
import { ModernPersonalTaskDisplayCard } from "./ModernPersonalTaskDisplayCard";

interface ITaskSection {
	personalTaskData: {
		todo: ITaskDisplayCard[];
		inprogress: ITaskDisplayCard[];
		done: ITaskDisplayCard[];
	};
	personalTaskDataLoading: boolean;
	endorsementTaskData: {
		aec: IMainDoc[];
		bm: IMainDoc[];
		hc: IMainDoc[];
	};
	endorsementTaskDataLoading: boolean;
	documentTaskData: {
		all: IMainDoc[];
		ba: IMainDoc[];
		directorate: IMainDoc[];
		lead: IMainDoc[];
		team: IMainDoc[];
	};
	documentTaskDataLoading: boolean;
}

export const MyTasksSection = ({
	personalTaskData,
	//   personalTaskDataLoading,
	endorsementTaskData,
	//   endorsementTaskDataLoading,
	documentTaskData,
}: //   documentTaskDataLoading,
ITaskSection) => {
	const { colorMode } = useColorMode();
	const [total, setTotal] = useState(0);

	useEffect(() => {
		console.log({
			personalTaskData,
			endorsementTaskData,
			documentTaskData,
		});
		personalTaskData &&
			endorsementTaskData &&
			documentTaskData &&
			setTotal(
				personalTaskData?.todo?.length +
					personalTaskData?.inprogress?.length +
					endorsementTaskData.aec.length +
					// endorsementTaskData.bm.length +
					// endorsementTaskData.hc.length +
					documentTaskData?.all?.length
			);
	}, [personalTaskData, endorsementTaskData, documentTaskData]);

	// useEffect(() => {
	//   console.log(total);
	// }, [total]);

	const renderEndorsementTaskCards = (documents, kind) => {
		if (!documents) return null;

		return documents.map((doc, index) => (
			<motion.div
				key={`endorsementtask${kind}${index}`}
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 10, opacity: 0 }}
				transition={{ duration: 0.4, delay: index / 8 }}
				style={{
					position: "relative",
					height: "100%",
					animation: "oscillate 8s ease-in-out infinite",
				}}
			>
				<ModernEndorsementTaskDisplayCard
					endorsement={doc}
					kind={kind}
				/>
			</motion.div>
		));
	};

	const renderDocumentTaskCards = (documents, kind) => {
		if (!documents) return null;

		return documents.map((doc, index) => (
			<motion.div
				key={`documenttask${kind}${index}`}
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 10, opacity: 0 }}
				transition={{ duration: 0.4, delay: index / 8 }}
				style={{
					position: "relative",
					height: "100%",
					animation: "oscillate 8s ease-in-out infinite",
				}}
			>
				<ModernDocumentTaskDisplayCard document={doc} kind={kind} />
			</motion.div>
		));
	};

	return total < 1 ? (
		<Box w={"100%"} h={"100%"}>
			<Text>Your tasks will be shown here...</Text>
		</Box>
	) : (
		<Flex flexDir={"column"} w={"100%"} h={"100%"}>
			{personalTaskData &&
			[...personalTaskData.todo, ...personalTaskData.inprogress].length >=
				1 ? (
				<>
					<Box position="relative" padding="10">
						<Divider />
						<AbsoluteCenter
							bg={colorMode === "light" ? "white" : "gray.800"}
							px="4"
						>
							<Heading size={"md"}>Quick Tasks</Heading>
						</AbsoluteCenter>
					</Box>

					<Grid
						gridTemplateColumns={{
							base: "repeat(1, 1fr)",
							md: "repeat(1, 1fr)",
							mdlg: "repeat(2, 1fr)",
							"1080px": "repeat(3, 1fr)",
							xl: "repeat(4, 1fr)",
							"2xl": "repeat(6, 1fr)",
						}}
						gridGap={4}
						gridRowGap={8}
						mb={6}
					>
						{(personalTaskData?.inprogress || [])
							.concat(personalTaskData?.todo || [])
							.map((task, index) => (
								<motion.div
									key={`quicktask${task.pk}_${task.status}_${index}`}
									initial={{ y: -10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 10, opacity: 0 }}
									transition={{
										duration: 0.4,
										delay: index / 8,
									}}
									layout
									layoutId={task.pk.toString()}
									style={{
										position: "relative",
										minHeight: "200px",
										height: "100%",
										maxHeight: "250px",
										animation:
											"oscillate 8s ease-in-out infinite",
									}}
								>
									<ModernPersonalTaskDisplayCard
										pk={task.pk}
										name={task.name}
										description={task.description}
										notes={task.notes}
										task_type={task.task_type}
										status={task.status}
										document={task.document}
										user={task.user}
										// project={task.project}
										date_assigned={task.date_assigned}
										creator={task.creator}
									/>
								</motion.div>
							))}
					</Grid>
				</>
			) : null}

			{/* documentTaskData?.directorate &&
documentTaskData?.ba && */}
			{documentTaskData?.team &&
			documentTaskData?.lead &&
			[
				...documentTaskData.team,
				...documentTaskData.lead,
				// ...documentTaskData.directorate,
				// ...documentTaskData.ba,
			].length >= 1 ? (
				<>
					<Box position="relative" padding="10">
						<Divider />
						<AbsoluteCenter
							bg={colorMode === "light" ? "white" : "gray.800"}
							px="4"
						>
							<Heading size={"md"}>Team Tasks</Heading>
						</AbsoluteCenter>
					</Box>
					<Grid
						gridTemplateColumns={{
							base: "repeat(1, 1fr)",
							md: "repeat(1, 1fr)",
							mdlg: "repeat(2, 1fr)",
							"1080px": "repeat(3, 1fr)",
							xl: "repeat(4, 1fr)",
							"2xl": "repeat(6, 1fr)",
						}}
						gridGap={4}
						gridRowGap={8}
						mb={6}
					>
						{renderDocumentTaskCards(
							documentTaskData?.lead,
							"project_lead"
						)}
						{renderDocumentTaskCards(
							documentTaskData?.team,
							"team"
						)}
						{/* {renderDocumentTaskCards(
							documentTaskData?.ba,
							"ba_lead"
						)}
						{renderDocumentTaskCards(
							documentTaskData?.directorate,
							"directorate"
						)} */}
					</Grid>
				</>
			) : null}

			{documentTaskData?.ba && [...documentTaskData.ba].length >= 1 ? (
				<>
					<Box position="relative" padding="10">
						<Divider />
						<AbsoluteCenter
							bg={colorMode === "light" ? "white" : "gray.800"}
							px="4"
						>
							<Heading size={"md"}>
								Business Area Lead Tasks
							</Heading>
						</AbsoluteCenter>
					</Box>
					<Grid
						gridTemplateColumns={{
							base: "repeat(1, 1fr)",
							md: "repeat(1, 1fr)",
							mdlg: "repeat(2, 1fr)",
							"1080px": "repeat(3, 1fr)",
							xl: "repeat(4, 1fr)",
							"2xl": "repeat(6, 1fr)",
						}}
						gridGap={4}
						gridRowGap={8}
						mb={6}
					>
						{renderDocumentTaskCards(
							documentTaskData?.ba,
							"ba_lead"
						)}
					</Grid>
				</>
			) : null}

			{documentTaskData?.directorate &&
			[...documentTaskData.directorate].length >= 1 ? (
				<>
					<Box position="relative" padding="10">
						<Divider />
						<AbsoluteCenter
							bg={colorMode === "light" ? "white" : "gray.800"}
							px="4"
						>
							<Heading size={"md"}>Directorate Tasks</Heading>
						</AbsoluteCenter>
					</Box>
					<Grid
						gridTemplateColumns={{
							base: "repeat(1, 1fr)",
							md: "repeat(1, 1fr)",
							mdlg: "repeat(2, 1fr)",
							"1080px": "repeat(3, 1fr)",
							xl: "repeat(4, 1fr)",
							"2xl": "repeat(6, 1fr)",
						}}
						gridGap={4}
						gridRowGap={8}
						mb={6}
					>
						{renderDocumentTaskCards(
							documentTaskData?.directorate,
							"directorate"
						)}
					</Grid>
				</>
			) : null}

			{endorsementTaskData?.aec &&
			endorsementTaskData?.bm &&
			endorsementTaskData?.hc &&
			[
				...endorsementTaskData.aec,
				...endorsementTaskData.bm,
				...endorsementTaskData.hc,
			].length >= 1 ? (
				<>
					<Box position="relative" padding="10">
						<Divider />
						<AbsoluteCenter
							bg={colorMode === "light" ? "white" : "gray.800"}
							px="4"
						>
							<Heading size={"md"}>Endorsement Tasks</Heading>
						</AbsoluteCenter>
					</Box>
					<Grid
						gridTemplateColumns={{
							base: "repeat(1, 1fr)",
							md: "repeat(1, 1fr)",
							mdlg: "repeat(2, 1fr)",
							"1080px": "repeat(3, 1fr)",
							xl: "repeat(4, 1fr)",
							"2xl": "repeat(6, 1fr)",
						}}
						gridGap={4}
						gridRowGap={8}
						mb={6}
					>
						{renderEndorsementTaskCards(
							endorsementTaskData?.aec,
							"aec"
						)}
						{renderEndorsementTaskCards(
							endorsementTaskData?.bm,
							"bm"
						)}
						{renderEndorsementTaskCards(
							endorsementTaskData?.hc,
							"hc"
						)}
					</Grid>
				</>
			) : null}
		</Flex>
	);
};
