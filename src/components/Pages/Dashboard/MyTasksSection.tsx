// Component for displaying the tasks the user has on the dashboard (modern)

import { Box, Center, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
import { TaskDisplayCard } from "./TaskDisplayCard"
import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ITaskDisplayCard } from "../../../types";


interface ITaskSection {
    data: {
        todo: ITaskDisplayCard[];
        inprogress: ITaskDisplayCard[];
        done: ITaskDisplayCard[];
    };
    loading: boolean;
}

export const MyTasksSection = ({ data, loading }: ITaskSection) => {
    const [inprogress, setInprogress] = useState<ITaskDisplayCard[]>([]);
    const [todo, setTodo] = useState<ITaskDisplayCard[]>([]);
    const [done, setDone] = useState<ITaskDisplayCard[]>([]);
    const [combinedData, setCombinedData] = useState<ITaskDisplayCard[]>([]);
    const [combinedDataKey, setCombinedDataKey] = useState<number>(0); // Key for <AnimatePresence>

    // Once the component receives new data, update the state accordingly
    useEffect(() => {
        if (!loading && data) {
            // console.log(data)

            // Filter and sort "assigned" tasks
            const sortedAssignedInprogress = data.inprogress.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedAssignedTodo = data.todo.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedAssignedDone = data.done.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

            // Filter and sort "personal" tasks
            const sortedPersonalInprogress = data.inprogress.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedPersonalTodo = data.todo.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedPersonalDone = data.done.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

            // Combine the sorted arrays, with "assigned" tasks coming first
            const combinedData = [
                ...sortedAssignedInprogress,
                ...sortedAssignedTodo,
                // ...sortedAssignedDone,
                ...sortedPersonalInprogress,
                ...sortedPersonalTodo,
                // ...sortedPersonalDone,
            ];

            setInprogress(combinedData.filter(item => item.task_type === "assigned"));
            setTodo(combinedData.filter(item => item.task_type === "assigned"));
            setDone(combinedData.filter(item => item.task_type === "assigned"));
            setCombinedData(combinedData);
            setCombinedDataKey(key => key + 1); // Update the key
        }
    }, [data, loading]);

    useLayoutEffect(() => {
        if (!loading && combinedData.length > 0) {
            const lastIndex = combinedData.length - 1;
            const lastCardId = combinedData[lastIndex].pk.toString();

            const newCard = document.getElementById(lastCardId);
            if (newCard) {
                newCard.style.opacity = "0";
                newCard.style.transform = "translateY(-10px)";

                requestAnimationFrame(() => {
                    newCard.style.opacity = "1";
                    newCard.style.transform = "translateY(0)";
                });
            }
        }
    }, [loading, combinedData]);

    // Combine the arrays in the desired order: inprogress, todo, done
    return (
        loading === true ?
            (
                <>
                    <Flex
                        w={"100%"}
                        h={"100%"}
                    >
                        <Center
                            w={"100%"}
                            h={"100%"}
                            py={20}
                        >
                            <Spinner
                                size={"xl"}
                            />
                        </Center>
                    </Flex>
                </>
            ) :
            <AnimatePresence key={combinedDataKey}>
                {combinedData.length < 1 ?
                    (
                        <Box
                            w={"100%"}
                            h={"100%"}
                        >
                            <Text>Nothing to see here...</Text>
                        </Box>
                    )
                    :
                    (
                        <Grid
                            gridTemplateColumns={{
                                base: "repeat(1, 1fr)",
                                md: "repeat(1, 1fr)",
                                "mdlg": "repeat(2, 1fr)",
                                "1080px": "repeat(3, 1fr)",
                                'xl': "repeat(4, 1fr)",
                            }}
                            gridGap={4}
                            gridRowGap={8}
                        >
                            {combinedData.map((card: ITaskDisplayCard, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                    layout
                                    layoutId={card.pk.toString()}
                                    style={{
                                        position: "relative",
                                        height: "100%",
                                        animation: "oscillate 8s ease-in-out infinite",
                                    }}
                                >
                                    <TaskDisplayCard
                                        pk={card.pk}
                                        name={card.name}
                                        description={card.description}
                                        notes={card.notes}
                                        task_type={card.task_type}
                                        status={card.status}
                                        document={card.document}
                                        user={card.user}
                                        project={card.project}
                                        date_assigned={card.date_assigned}
                                        creator={card.creator}
                                    />

                                </motion.div>
                            ))}
                        </Grid>

                    )
                }

            </AnimatePresence>

    )
}