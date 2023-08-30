// WIP: Route for handling tasks - will implement a kanban board and boards

import { Box, Center, Text, Grid } from "@chakra-ui/react"
import { Head } from "../components/Base/Head"

export const Tasks = () => {
    return (
        <>
            <Box mt={5}>
                <Head title="Tasks" />

                <Box mb={6}>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>Tasks
                    </Text>
                </Box>

                <Center mt={20}>
                    <Grid
                        gridGap={8}
                        textAlign={"center"}
                    >
                        <Text fontWeight={"bold"} fontSize={"2xl"}>Section on hold until data hooked in</Text>
                        <Text fontWeight={"bold"} fontSize={"xl"}>Presents a kanban board</Text>
                    </Grid>
                </Center>
            </Box>

        </>
    )
}