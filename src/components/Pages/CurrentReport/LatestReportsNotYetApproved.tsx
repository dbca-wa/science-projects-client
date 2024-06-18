// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { ARProgressReportHandler } from "@/components/RichTextEditor/Editors/ARProgressReportHandler";
import { ARStudentReportHandler } from "@/components/RichTextEditor/Editors/ARStudentReportHandler";
// import whitePaperBackground from "@/images/white-texture.jpg";
import { useLatestYearsUnapprovedReports } from "@/lib/hooks/tanstack/useLatestReportsUnapproved";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	Box,
	Center,
	Flex,
	Spinner,
	Text,
	useColorMode,
} from "@chakra-ui/react";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";

export const LatestReportsNotYetApproved = () => {
	const { unapprovedData, unapprovedLoading } =
		useLatestYearsUnapprovedReports();

	const { userData, userLoading } = useUser();

	const A4Width = 210; // in millimeters
	const A4Height = A4Width * 1.414; // 1.414 is the aspect ratio of A4 paper (297 / 210)

	const { colorMode } = useColorMode();

	return (
		<Box w={"100%"}>
			{unapprovedLoading || unapprovedData === undefined ? (
				<Center>
					<Spinner />
				</Center>
			) : (
				<Box
					display={"flex"}
					flexDir={"column"}
					margin={"auto"}
					minH={`${A4Height}mm`}
					maxW={`${A4Width}mm`}
					py={4}
					// bg={"orange"}
					position="relative"

					// zIndex={1}
				>
					<Box
						position="absolute"
						minH={`${A4Height}mm`}
						top="0"
						left="0"
						right="0"
						bottom="0"
						// backgroundImage={`url(${whitePaperBackground})`}
						background={"white"}
						backgroundSize="cover"
						backgroundPosition="center"
						backgroundRepeat="no-repeat"
						// transform="rotate(90deg)" // Rotate the background image by 90 degrees
						opacity={0.25} // Set the opacity of the background image
						zIndex={0}
					/>
					{unapprovedData["student_reports"].length +
						unapprovedData["progress_reports"].length <
					1 ? (
						<Center>
							<Text pos={"absolute"} top={10}>
								There are no unapproved reports for this year
							</Text>
						</Center>
					) : (
						<Accordion
							defaultIndex={[0]}
							allowMultiple
							zIndex={2}
							w={"100%"}
							// bg={"red"}
						>
							<AccordionItem
								mt={-4}
								borderColor={
									colorMode === "light"
										? "blackAlpha.500"
										: "whiteAlpha.600"
								}
								borderBottom={"none"}
								borderTop={"none"}
								zIndex={999}
								opacity={1.5}
								w={"100%"}
							>
								<AccordionButton
									// bg={colorMode === "light" ? "gray.200" : "gray.700"}
									bg={
										colorMode === "light"
											? "blue.500"
											: "blue.600"
									}
									w={"100%"}
									color={"white"}
									_hover={
										colorMode === "light"
											? { bg: "blue.400" }
											: { bg: "blue.500" }
									}
									userSelect={"none"}
									opacity={0.9}
									borderBottomRadius={"50%"}
									alignItems={"center"}
									justifyContent={"center"}
								>
									<Center mb={4} mt={4} ml={6}>
										<Box
											display="flex"
											alignItems="center"
											justifyContent="center"
											width={8}
											height={8}
											mr={4}
										>
											<RiBook3Fill size={"lg"} />
										</Box>
										<Text
											fontWeight={"bold"}
											fontSize={"xl"}
											// color={"black"}
										>
											Student Reports (
											{
												unapprovedData[
													"student_reports"
												].length
											}
											)
										</Text>
									</Center>
								</AccordionButton>
								<AccordionPanel py={4} mt={4}>
									{unapprovedData &&
										unapprovedData["student_reports"]?.map(
											(sr, index) => {
												return (
													<ARStudentReportHandler
														key={`student${index}`}
														canEdit={
															userData?.is_superuser ||
															userData
																?.business_area
																?.name ===
																"Directorate"
														}
														report={sr}
														shouldAlternatePicture={
															index % 2 !== 0
														}
													/>
												);
											}
										)}
								</AccordionPanel>
							</AccordionItem>

							<AccordionItem
								mt={4}
								borderColor={
									colorMode === "light"
										? "blackAlpha.500"
										: "whiteAlpha.600"
								}
								borderBottom={"none"}
								borderTop={"none"}
								zIndex={999}
								opacity={1.5}
								w={"100%"}
							>
								<AccordionButton
									// bg={colorMode === "light" ? "gray.200" : "gray.700"}
									bg={
										colorMode === "light"
											? "green.500"
											: "green.600"
									}
									w={"100%"}
									color={"white"}
									_hover={
										colorMode === "light"
											? { bg: "green.400" }
											: { bg: "green.500" }
									}
									userSelect={"none"}
									opacity={0.9}
									borderBottomRadius={"50%"}
									alignItems={"center"}
									justifyContent={"center"}
								>
									<Flex mb={4} mt={4} ml={6}>
										<Box
											display="flex"
											alignItems="center"
											justifyContent="center"
											width={8}
											height={8}
											mr={4}
										>
											<MdScience size={"lg"} />
										</Box>
										<Text
											fontWeight={"bold"}
											fontSize={"xl"}
											// color={"black"}
										>
											Progress Reports (
											{
												unapprovedData[
													"progress_reports"
												].length
											}
											)
										</Text>
									</Flex>
								</AccordionButton>
								<AccordionPanel py={4} mt={4}>
									{unapprovedData &&
										unapprovedData["progress_reports"]?.map(
											(pr, index) => {
												return (
													<ARProgressReportHandler
														key={`ordinary${index}`}
														canEdit={
															userData?.is_superuser ||
															userData
																?.business_area
																?.name ===
																"Directorate"
														}
														report={pr}
														shouldAlternatePicture={
															index % 2 !== 0
														}
													/>
												);
											}
										)}
								</AccordionPanel>
							</AccordionItem>
						</Accordion>
					)}
				</Box>
			)}
		</Box>
	);
};
{
	/* {unapprovedData &&
            unapprovedData["progress_reports"]?.map((pr, index) => {
              return (
                <Box key={`progress${index}`}>
                  <Text>
                    {index}. {pr?.progress}
                  </Text>
                </Box>
              );
            })}

          {unapprovedData["progress_reports"]?.length === 0 &&
            unapprovedData["student_reports"]?.length === 0 && (
              <Center mt={10}>
                <Text fontWeight={"bold"} fontSize={"xl"}>
                  All reports for this year have been approved
                </Text>
              </Center>
            )} */
}
