// Component for displaying the tasks the user has on the dashboard (modern)

import { AbsoluteCenter, Box, Center, Divider, Flex, Grid, Heading, Spinner, Text } from "@chakra-ui/react"
// import { TaskDisplayCard } from "./TaskDisplayCard"
import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IMainDoc, ITaskDisplayCard } from "../../../types";
import { ModernPersonalTaskDisplayCard } from "./ModernPersonalTaskDisplayCard";
import { ModernEndorsementTaskDisplayCard } from "./ModernEndorsementTaskDisplayCard";
import { ModernDocumentTaskDisplayCard } from "./ModernDocumentTaskDisplayCard";




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
        team: IMainDoc[];
    };
    documentTaskDataLoading: boolean;

}

export const MyTasksSection = ({
    personalTaskData,
    personalTaskDataLoading,
    endorsementTaskData,
    endorsementTaskDataLoading,
    documentTaskData,
    documentTaskDataLoading,
}: ITaskSection) => {
    const [inprogress, setInprogress] = useState<ITaskDisplayCard[]>([]);
    const [todo, setTodo] = useState<ITaskDisplayCard[]>([]);

    const [done, setDone] = useState<ITaskDisplayCard[]>([]);
    // const [combinedTaskData, setCombinedTaskData] = useState<ITaskDisplayCard[]>([]);
    // const [combinedDataKey, setCombinedTaskDataKey] = useState<number>(0); // Key for <AnimatePresence>

    // // Once the component receives new data, update the state accordingly
    // useEffect(() => {
    //     if (!personalTaskDataLoading && personalTaskData) {
    //         // console.log(data)

    //         // Filter and sort "assigned" tasks
    //         const sortedAssignedInprogress = personalTaskData?.inprogress.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
    //         const sortedAssignedTodo = personalTaskData?.todo.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
    //         const sortedAssignedDone = personalTaskData?.done.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

    //         // Filter and sort "personal" tasks
    //         const sortedPersonalInprogress = personalTaskData?.inprogress.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
    //         const sortedPersonalTodo = personalTaskData?.todo.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
    //         const sortedPersonalDone = personalTaskData?.done.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

    //         // Combine the sorted arrays, with "assigned" tasks coming first
    //         const combinedData = [
    //             ...sortedAssignedInprogress,
    //             ...sortedAssignedTodo,
    //             // ...sortedAssignedDone,
    //             ...sortedPersonalInprogress,
    //             ...sortedPersonalTodo,
    //             // ...sortedPersonalDone,
    //         ];

    //         setInprogress(combinedTaskData?.filter(item => item.task_type === "assigned"));
    //         setTodo(combinedTaskData?.filter(item => item.task_type === "assigned"));
    //         setDone(combinedTaskData?.filter(item => item.task_type === "assigned"));
    //         setCombinedTaskData(combinedData);
    //         setCombinedTaskDataKey(key => key + 1); // Update the key
    //     }
    // }, [personalTaskData, personalTaskDataLoading]);

    // useLayoutEffect(() => {
    //     if (!personalTaskDataLoading && combinedTaskData?.length > 0) {
    //         const lastIndex = combinedTaskData?.length - 1;
    //         const lastCardId = personalTaskData[lastIndex].pk.toString();

    //         const newCard = document.getElementById(lastCardId);
    //         if (newCard) {
    //             newCard.style.opacity = "0";
    //             newCard.style.transform = "translateY(-10px)";

    //             requestAnimationFrame(() => {
    //                 newCard.style.opacity = "1";
    //                 newCard.style.transform = "translateY(0)";
    //             });
    //         }
    //     }
    // }, [personalTaskDataLoading, combinedTaskData]);

    // Combine the arrays in the desired order: inprogress, todo, done
    const [total, setTotal] = useState(0);

    useEffect(() => {
        console.log(
            {
                personalTaskData, endorsementTaskData, documentTaskData
            }
        )
        personalTaskData && endorsementTaskData && documentTaskData &&
            setTotal(
                personalTaskData?.todo?.length +
                personalTaskData?.inprogress?.length +
                endorsementTaskData.aec.length + endorsementTaskData.bm.length + endorsementTaskData.hc.length +
                documentTaskData?.all?.length
            )
    }, [personalTaskData, endorsementTaskData, documentTaskData])

    useEffect(() => {
        console.log(total)
    }, [total])
    return (

        total < 1 ?
            (
                <Box
                    w={"100%"}
                    h={"100%"}
                >
                    <Text>Your tasks will be shown here...</Text>
                </Box>
            ) :
            (
                <Flex
                    flexDir={"column"}
                    w={"100%"}
                    h={"100%"}
                >
                    {
                        personalTaskData && [
                            ...personalTaskData.todo,
                            ...personalTaskData.inprogress
                        ].length >= 1 ?
                            (
                                <>
                                    <Box position='relative' padding='10'>
                                        <Divider />
                                        <AbsoluteCenter bg='white' px='4'>
                                            <Heading
                                                size={"md"}
                                            >
                                                Quick Tasks
                                            </Heading>
                                        </AbsoluteCenter>
                                    </Box>
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
                                        {
                                            personalTaskData?.inprogress?.map((task, index) => {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                        layout
                                                        layoutId={task.pk.toString()}
                                                        style={{
                                                            position: "relative",
                                                            height: "100%",
                                                            animation: "oscillate 8s ease-in-out infinite",
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
                                                            project={task.project}
                                                            date_assigned={task.date_assigned}
                                                            creator={task.creator}
                                                        />

                                                    </motion.div>
                                                )
                                            })
                                        }
                                        {
                                            personalTaskData?.todo?.map((task, index) => {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                        layout
                                                        layoutId={task.pk.toString()}
                                                        style={{
                                                            position: "relative",
                                                            height: "100%",
                                                            animation: "oscillate 8s ease-in-out infinite",
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
                                                            project={task.project}
                                                            date_assigned={task.date_assigned}
                                                            creator={task.creator}
                                                        />

                                                    </motion.div>
                                                )
                                            })
                                        }

                                    </Grid>

                                </>

                            ) :
                            null

                    }



                    {
                        documentTaskData?.team &&
                            documentTaskData?.directorate &&
                            documentTaskData?.ba &&
                            ([
                                ...documentTaskData.team,
                                ...documentTaskData.directorate,
                                ...documentTaskData.ba
                            ].length) >= 1 ? (
                            <>
                                <Box position='relative' padding='10'>
                                    <Divider />
                                    <AbsoluteCenter bg='white' px='4'>
                                        <Heading
                                            size={"md"}
                                        >
                                            Document Tasks
                                        </Heading>
                                    </AbsoluteCenter>
                                </Box>
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
                                    {
                                        documentTaskData?.team?.map((teamDoc, index) => {
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 10, opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                    layout
                                                    layoutId={teamDoc.pk.toString()}
                                                    style={{
                                                        position: "relative",
                                                        height: "100%",
                                                        animation: "oscillate 8s ease-in-out infinite",
                                                    }}
                                                >
                                                    <ModernDocumentTaskDisplayCard
                                                        document={teamDoc}
                                                        kind={"project_lead"}
                                                    />
                                                </motion.div>
                                            )
                                        })
                                    }
                                    {
                                        documentTaskData?.ba?.map((baDoc, index) => {
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 10, opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                    layout
                                                    layoutId={baDoc.pk.toString()}
                                                    style={{
                                                        position: "relative",
                                                        height: "100%",
                                                        animation: "oscillate 8s ease-in-out infinite",
                                                    }}
                                                >
                                                    <ModernDocumentTaskDisplayCard
                                                        document={baDoc}
                                                        kind={"ba_lead"}
                                                    />
                                                </motion.div>

                                            )
                                        })
                                    }

                                    {
                                        documentTaskData?.directorate?.map((directorateDoc, index) => {
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 10, opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                    layout
                                                    layoutId={directorateDoc.pk.toString()}
                                                    style={{
                                                        position: "relative",
                                                        height: "100%",
                                                        animation: "oscillate 8s ease-in-out infinite",
                                                    }}
                                                >
                                                    <ModernDocumentTaskDisplayCard
                                                        document={directorateDoc}
                                                        kind={"directorate"}
                                                    />
                                                </motion.div>

                                            )
                                        })
                                    }

                                </Grid>

                            </>
                        ) : null

                    }
                    {
                        endorsementTaskData?.aec &&
                            endorsementTaskData?.bm &&
                            endorsementTaskData?.hc &&
                            ([
                                ...endorsementTaskData.aec,
                                ...endorsementTaskData.bm,
                                ...endorsementTaskData.hc
                            ].length) >= 1 ?
                            (
                                <>

                                    <Box position='relative' padding='10'>
                                        <Divider />
                                        <AbsoluteCenter bg='white' px='4'>
                                            <Heading
                                                size={"md"}
                                            >
                                                Endorsement Tasks
                                            </Heading>
                                        </AbsoluteCenter>
                                    </Box>
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

                                        {
                                            endorsementTaskData?.aec?.map((aecDoc, index) => {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                        layout
                                                        layoutId={aecDoc.pk.toString()}
                                                        style={{
                                                            position: "relative",
                                                            height: "100%",
                                                            animation: "oscillate 8s ease-in-out infinite",
                                                        }}
                                                    >
                                                        <ModernEndorsementTaskDisplayCard
                                                            document={aecDoc}
                                                            kind={"aec"}
                                                        />

                                                    </motion.div>

                                                )
                                            })
                                        }
                                        {
                                            endorsementTaskData?.bm?.map((bmDoc, index) => {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                        layout
                                                        layoutId={bmDoc.pk.toString()}
                                                        style={{
                                                            position: "relative",
                                                            height: "100%",
                                                            animation: "oscillate 8s ease-in-out infinite",
                                                        }}
                                                    >
                                                        <ModernEndorsementTaskDisplayCard
                                                            document={bmDoc}
                                                            kind={"bm"}
                                                        />

                                                    </motion.div>

                                                )
                                            })
                                        }
                                        {
                                            endorsementTaskData?.hc?.map((hcDoc, index) => {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: (((index) / 8)) }}
                                                        layout
                                                        layoutId={hcDoc.pk.toString()}
                                                        style={{
                                                            position: "relative",
                                                            height: "100%",
                                                            animation: "oscillate 8s ease-in-out infinite",
                                                        }}
                                                    >
                                                        <ModernEndorsementTaskDisplayCard
                                                            document={hcDoc}
                                                            kind={"hc"}
                                                        />
                                                    </motion.div>

                                                )
                                            })
                                        }

                                    </Grid>
                                </>
                            ) : null

                    }
                </Flex>
            )


        // <AnimatePresence key={combinedDataKey}>
        //     {combinedTaskData?.length < 1 ?
        //         (
        //             <Box
        //                 w={"100%"}
        //                 h={"100%"}
        //             >
        //                 <Text>Your tasks will be shown here...</Text>
        //             </Box>
        //         )
        //         :
        //         (
        //             <Grid
        //                 gridTemplateColumns={{
        //                     base: "repeat(1, 1fr)",
        //                     md: "repeat(1, 1fr)",
        //                     "mdlg": "repeat(2, 1fr)",
        //                     "1080px": "repeat(3, 1fr)",
        //                     'xl': "repeat(4, 1fr)",
        //                 }}
        //                 gridGap={4}
        //                 gridRowGap={8}
        //             >
        //                 {combinedTaskData?.map((card: ITaskDisplayCard, index: number) => (
        //                     <motion.div
        //                         key={index}
        //                         initial={{ y: -10, opacity: 0 }}
        //                         animate={{ y: 0, opacity: 1 }}
        //                         exit={{ y: 10, opacity: 0 }}
        //                         transition={{ duration: 0.4, delay: (((index) / 8)) }}
        //                         layout
        //                         layoutId={card.pk.toString()}
        //                         style={{
        //                             position: "relative",
        //                             height: "100%",
        //                             animation: "oscillate 8s ease-in-out infinite",
        //                         }}
        //                     >
        //                         <TaskDisplayCard
        //                             pk={card.pk}
        //                             name={card.name}
        //                             description={card.description}
        //                             notes={card.notes}
        //                             task_type={card.task_type}
        //                             status={card.status}
        //                             document={card.document}
        //                             user={card.user}
        //                             project={card.project}
        //                             date_assigned={card.date_assigned}
        //                             creator={card.creator}
        //                         />

        //                     </motion.div>
        //                 ))}
        //             </Grid>

        //         )
        //     }

        // </AnimatePresence>

    )
}