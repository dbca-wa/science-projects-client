import { useMyBusinessAreas } from "@/lib/hooks/tanstack/useMyBusinessAreas";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import { BusinessAreaEditableDisplay } from "./BusinessAreaEditableDisplay";
import { useState } from "react";
// Show BAs how their BA will display on AR

export const MyBusinessArea = () => {
	const { userData, userLoading } = useUser();
	const {
		basLoading,
		baData: myBusinessAreas,
		refetch,
	} = useMyBusinessAreas();
	const { colorMode } = useColorMode();

	const [isRepainting, setIsRepainting] = useState(false);

	const softRefetch = async () => {
		setIsRepainting(true);
		await refetch();
		setIsRepainting(false);
	};

	return (
		<>
			{!userLoading && (
				<Box maxW={"100%"} maxH={"100%"}>
					{/* Count of BAs Led and title */}
					{!basLoading && !isRepainting && (
						<>
							<Box mb={4}>
								<Text fontWeight={"semibold"} fontSize={"lg"}>
									My Business Area
									{myBusinessAreas?.length > 1 &&
										`s (${myBusinessAreas.length})`}
								</Text>
							</Box>

							<Box mb={4}>
								<Text
									color={
										colorMode === "light"
											? "gray.500"
											: "gray.300"
									}
								>
									{myBusinessAreas.length < 1
										? "You are not leading any business areas."
										: "This section provides an idea of how your business area intro will look on the Annual Report before progress reports are shown"}
								</Text>
							</Box>

							<Center
								w="100%"
								// bg={"red.800"}
							>
								<Box
									// display={"flex"}
									// flexDir={"column"}
									w={"240mm"}
									h={"100%"}
									// bg={"orange"}
									my={3}
								>
									{myBusinessAreas?.map((ba) => (
										<BusinessAreaEditableDisplay
											key={ba.pk}
											pk={ba.pk}
											leader={userData}
											name={ba.name}
											introduction={ba.introduction}
											image={ba.image}
											refetch={softRefetch}
										/>
									))}
								</Box>
							</Center>
						</>
					)}
				</Box>
			)}
		</>
	);
};
