import TestEmail from "@/components/Emails/TestEmail"
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react"


export const TestEmailPage = () => {
    return (
        <Box>
            <Text fontWeight={"bold"} fontSize={"xl"}>See below for emails visualised</Text>
            <Grid
                pt={8}
                gridTemplateColumns={"repeat(3, 1fr)"}
                gridGap={4}


            >
                <Box
                    alignItems={"center"}
                    justifyContent={"center"}
                    w={"100%"}
                    alignContent={"center"}
                    bg={"gray.50"}
                >
                    <Box
                        border={"1px solid"}
                        borderColor={"gray.300"}
                    >
                        <TestEmail />

                    </Box>
                    <Flex justifyContent={"flex-end"} mt={-10} bg={"gray.200"} py={4} px={6}
                        border={"1px solid"}
                        borderColor={"gray.300"}

                    >
                        <Button colorScheme={"blue"}>Send Test Email</Button>
                    </Flex>
                </Box>
            </Grid>

        </Box>
    )
}