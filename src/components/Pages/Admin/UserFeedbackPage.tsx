import { useGetUserFeedback } from "@/lib/hooks/useGetUserFeedback";
import {
  Box,
  Center,
  Flex,
  Grid,
  Select,
  Spinner,
  Tag,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { ChatUser } from "../Chat/ChatUser";
import { useBusinessAreas } from "@/lib/hooks/useBusinessAreas";
import { useBranches } from "@/lib/hooks/useBranches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateFeedbackStatus, updateUserFeedbackStatus } from "@/lib/api";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { v4 as uuidv4 } from 'uuid';

export const UserFeedbackPage = () => {
  const { colorMode } = useColorMode();
  const { feedbackData, feedbackLoading } = useGetUserFeedback();
  const { baData } = useBusinessAreas();
  const { branchesData } = useBranches();





  return (
    <>
      {/* <Flex mb={8}>
        <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>
          User Feedback
        </Text>
      </Flex> */}
      {feedbackData && baData && branchesData && !feedbackLoading ? (
        feedbackData?.length > 0 ? (
          <>
            <KanbanBoard data={feedbackData} baData={baData} branchesData={branchesData} />

            <Grid
              gridTemplateColumns={{
                base: "repeat(1, 1fr)",
                xl: "repeat(2, 1fr)",
                "2xl": "repeat(4, 1fr)",
              }}
              gridGap={4}
            >
              {feedbackData?.map((item, idx) => {
                return (
                  <FeedbackCard index={idx} key={idx} colorMode={colorMode} baData={baData} branchesData={branchesData} feedbackItem={item} />
                );
              })}
            </Grid>
          </>
        ) : (
          <Text fontWeight={"semibold"} fontSize={""}>
            There is no feedback.
          </Text>
        )
      ) : (
        <Center my={2}>
          <Spinner />
        </Center>
      )}
    </>
  );
};

interface FeedbackCardProps {
  index: number;
  colorMode: string;
  branchesData: any;
  baData: any;
  feedbackItem: any;
}

const FeedbackCard = ({ index, colorMode, branchesData, baData, feedbackItem }: FeedbackCardProps) => {
  const onChangeStatus = (formData: IUpdateFeedbackStatus) => {
    feedbackUpdateMutation.mutate(formData);
  };
  const queryClient = useQueryClient();
  const { reset } = useForm<IUpdateFeedbackStatus>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const statusDict = {
    new: "New",
    inprogress: "In Progress",
    logged: "Logged",
    fixed: "Fixed",
  };


  const feedbackUpdateMutation = useMutation(updateUserFeedbackStatus, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Status",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Status Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();

      setTimeout(() => {
        queryClient.invalidateQueries(["userfeedback"]);
        queryClient.refetchQueries([`userfeedback`]);
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update Status",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });


  return (
    <motion.div
      key={index}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3, delay: (index + 0.25) / 7 }}
      style={{ height: "100%" }}
    >
      <Box
        px={4}
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
        minH={"125px"}
        h={"100%"}
        rounded={"lg"}
        pb={20}
        pt={2}
        pos={"relative"}
      >
        <ChatUser
          branches={branchesData}
          businessAreas={baData}
          user={feedbackItem.user}
          avatarSrc={feedbackItem?.user?.image}
          displayName={`${feedbackItem.user?.first_name} ${feedbackItem.user?.last_name}`}
          nameCentered={true}
          otherUser={true}
        />
        <Box mt={4}>
          <Text>{feedbackItem.text}</Text>
        </Box>
        <Flex
          justifyContent={"flex-end"}
          pos={"absolute"}
          right={6}
          top={7}
        >
          <Tag
            background={
              feedbackItem.status === "new"
                ? "red.600"
                : feedbackItem.status === "fixed"
                  ? "green.600"
                  : feedbackItem.status === "logged"
                    ? "blue.600"
                    : "orange.600"
            }
            color={"white"}
          >
            {statusDict[feedbackItem.status]}
          </Tag>
        </Flex>
        <Flex
          justifyContent={"flex-end"}
          pos={"absolute"}
          right={5}
          bottom={5}
          w={"50%"}
        >
          <Select
            background={colorMode === "light" ? "gray.50" : undefined}
            onChange={(e) =>
              onChangeStatus({
                pk: feedbackItem.id,
                status: e.target.value,
              })
            }
            value={feedbackItem.status}
            w={"135px"}
            textAlign={"center"}
          >
            {Object.entries(statusDict).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </Select>
        </Flex>
      </Box>
    </motion.div>
  )
}

interface KBProps {
  data: any[];
  baData: any[];
  branchesData: any[];
}

const KanbanBoard = ({ data, baData, branchesData }: KBProps) => {
  const [newTodo, setNewTodo] = useState(Array.from(data).filter((item) => item.status === "new"));
  const [logged, setLogged] = useState(Array.from(data).filter((item) => item.status === "logged" || item.status === "inprogress"));
  const [fixed, setFixed] = useState(Array.from(data).filter((item) => item.status === "fixed"));
  // const [inProgress, setInProgress] = useState([]);

  const columnData = {
    [uuidv4()]: {
      title: "NEW",
      items: [...newTodo],
      color: "red",
    },
    [uuidv4()]: {
      title: "LOGGED",
      items: [...logged],
      color: "blue",
    },
    [uuidv4()]: {
      title: "FIXED",
      items: [...fixed],
      color: "green",
    }
  }

  const [columns, setColumns] = useState(columnData);


  const simpleOnDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }

  }


  return (
    <DragDropContext
      onDragEnd={result => simpleOnDragEnd(result, columns, setColumns)}
    >
      <Text textAlign={"center"} fontWeight={"semibold"} fontSize={"4xl"} pb={8}>User Feedback</Text>
      <Grid
        gridTemplateColumns={"repeat(3, 1fr)"}
        gridGap={4}
        pb={8}
        css={{
          "*::-webkit-scrollbar": {
            width: "0px", // Fix: Use a semicolon here instead of a colon
            backgroundColor: "transparent",
          },
          /* Track */
          "*::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          /* Handle */
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "3px",
          },
          /* Handle on hover */
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
          /* Rounded edges at top and bottom */
          "*::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        }}

      >

        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <KanbanColumn
              key={columnId}
              id={columnId}
              title={column.title}
              columnTitleBgColour={column.color}
              tasks={column.items}
              baData={baData}
              branchesData={branchesData} />
          )
        })}
      </Grid>
    </DragDropContext>
  )
}
// import "@/styles/modalscrollbar.css";

interface BoardProps {
  title: string;
  columnTitleBgColour: string;
  tasks: any[];
  id: string;
  baData: any[];
  branchesData: any[];
}

const KanbanColumn = ({ title, tasks, id, columnTitleBgColour, baData, branchesData, currentlyDraggingIndex }: BoardProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      background={colorMode === "light" ? "gray.50" : "gray.800"}
      // w={300}
      h={500}
      border={"1px solid"}
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      rounded={'3xl'}
      overflowY={"scroll"}
      overflowX={"hidden"}
      position="relative"
    >
      <Box
        padding={"8px"}
        backgroundColor={colorMode === "light" ? `${columnTitleBgColour}.600` : `${columnTitleBgColour}.700`} color={"white"}
        h={"50px"}
        textAlign={"center"}
        alignItems={"center"}
        justifyContent={"center"}
        top={0}
        zIndex={1}
        pos={"sticky"}

      >
        <Text fontWeight={"semibold"} fontSize={"xl"}>
          {title}
        </Text>
      </Box>


      <Droppable droppableId={id} key={id}>
        {(provided, snapshot) => (
          <Flex
            {...provided.droppableProps}
            ref={provided.innerRef}

            // isDraggingOver={snapshot.isDraggingOver}
            padding="3px"
            gridGap={2}
            p={4}
            px={2}
            flexDir={"column"}

            transition={"background-color 0.2s ease"}
            backgroundColor={"f4f5f7"}
            flexGrow={1}
            minH={"100px"}
          >
            {tasks.map((task, index) => (
              <DraggableFeedbackCard
                key={task.pk}
                index={index}
                draggableId={String(task.pk)}

                colorMode={colorMode}
                branchesData={branchesData}
                baData={baData}
                feedbackItem={task}
              />
            ))}
            {provided.placeholder}
          </Flex>
        )}
      </Droppable>
    </Box >
  );
};

interface DraggableFeedbackCardProps {
  index: number;
  colorMode: string;
  branchesData: any;
  baData: any;
  feedbackItem: any;
  draggableId: string;
  // currentlyDraggingIndex: number;
}



const DraggableFeedbackCard = ({ index, colorMode, branchesData, baData, feedbackItem, draggableId }: DraggableFeedbackCardProps) => {
  const onChangeStatus = (formData: IUpdateFeedbackStatus) => {
    feedbackUpdateMutation.mutate(formData);
  };
  const queryClient = useQueryClient();
  const { reset } = useForm<IUpdateFeedbackStatus>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const statusDict = {
    new: "New",
    inprogress: "In Progress",
    logged: "Logged",
    fixed: "Fixed",
  };


  const feedbackUpdateMutation = useMutation(updateUserFeedbackStatus, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Status",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Status Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();

      setTimeout(() => {
        queryClient.invalidateQueries(["userfeedback"]);
        queryClient.refetchQueries([`userfeedback`]);
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update Status",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });


  return (
    <Draggable draggableId={draggableId} key={draggableId} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}

          py={1}
          as={motion.div}
          userSelect={"none"}
          // isDragging={snapshot.isDragging}
          key={index}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}

          px={4}
          bg={snapshot.isDragging ? "blue.500" : colorMode === "light" ? "gray.100" : "gray.700"}
          minH={"125px"}
          h={"100%"}
          rounded={"lg"}
          pb={20}
          pt={2}
          pos={"relative"}
          style={{
            height: "100%",
            transitionDuration: "0.3s",
            transitionDelay: `${(index + 0.25) / 7}s`,
            ...provided.draggableProps.style
          }}
        >
          <ChatUser
            branches={branchesData}
            businessAreas={baData}
            user={feedbackItem.user}
            avatarSrc={feedbackItem?.user?.image}
            displayName={`${feedbackItem.user?.first_name} ${feedbackItem.user?.last_name}`}
            nameCentered={true}
            otherUser={true}
            usernameColour={snapshot.isDragging ? "white" : undefined}
          />
          <Box mt={4}>
            <Text color={snapshot.isDragging ? "white" : undefined}
            >{feedbackItem.text}</Text>
          </Box>
          {provided.placeholder}

        </Box>
      )}
    </Draggable>

  )

}