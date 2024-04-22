// import { celeryStartTask, celeryStopTask } from "@/lib/api"
// import { Button, Box, Text, Flex, useColorMode } from "@chakra-ui/react"
// import { useMutation } from "@tanstack/react-query"

// export const CeleryTest = () => {

//     const celeryStartMutation = useMutation(celeryStartTask, {

//     })

//     const celeryStopMutation = useMutation(celeryStopTask, {

//     })

//     const { colorMode } = useColorMode();
//     return (
//         <Flex justifyContent={"flex-end"}>
//             <Text flex={1}>Testing Celery...</Text>

//             <Flex>
//                 <Button
//                     size={"sm"}
//                     variant={"solid"}
//                     color={"white"}
//                     background={
//                         colorMode === "light" ? "gray.500" : "gray.600"
//                     }
//                     _hover={{
//                         cursor: "pointer",
//                         background:
//                             colorMode === "light" ? "gray.400" : "gray.500",
//                     }}
//                     loadingText={"Canceling..."}
//                     type="submit"
//                     form="celery-task-start-form"
//                     isLoading={celeryStartMutation.isLoading}
//                     isDisabled={celeryStartMutation.isLoading}
//                 >
//                     Cancel Task
//                 </Button>
//                 <Button ml={4}
//                     size={"sm"}
//                     variant={"solid"}
//                     color={"white"}
//                     background={
//                         colorMode === "light" ? "green.500" : "green.600"
//                     }
//                     _hover={{
//                         cursor: "pointer",
//                         background:
//                             colorMode === "light" ? "green.400" : "green.500",
//                     }}
//                     loadingText={"Canceling..."}
//                     type="submit"
//                     form="celery-task-stop-form"
//                     isLoading={celeryStopMutation.isLoading}
//                     isDisabled={celeryStopMutation.isLoading}
//                 >
//                     Start Task
//                 </Button>
//             </Flex>
//         </Flex>

//     )
// }