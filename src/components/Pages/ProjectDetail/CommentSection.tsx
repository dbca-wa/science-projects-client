import { useGetDocumentComments } from "@/lib/hooks/useGetDocumentComments";
import { IMainDoc, IUserData, IUserMe } from "@/types";
import {
  Box,
  Center,
  Divider,
  Grid,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CommentRichTextEditor } from "@/components/RichTextEditor/Editors/CommentRichTextEditor";
import { CommentDisplayRTE } from "@/components/RichTextEditor/Editors/Sections/CommentDisplayRTE";
import { AnimatePresence, motion } from "framer-motion";

export interface IDocumentComment {
  document: IMainDoc;
  user: IUserData;
  created_at: Date;
  updated_at: Date;
  text: string;
  is_public: boolean;
  is_removed: boolean;
}

interface Props {
  documentID: number;
  userData: IUserMe;
}
export const CommentSection = ({ documentID, userData }: Props) => {
  const { colorMode } = useColorMode();

  const { documentCommentsLoading, documentCommentsData, refetchComments } =
    useGetDocumentComments(documentID);

  const [isRepainting, setIsRepainting] = useState(true);

  const refetchInterceptedFunction = () => {
    setIsRepainting(true);
    refetchComments();
  };

  useEffect(() => {
    // if (documentCommentsLoading) {
    //   setIsRepainting(true);

    // }
    if (!documentCommentsLoading && isRepainting) {
      setIsRepainting(false);
    }
  }, [documentCommentsLoading, isRepainting]);

  useEffect(() => {
    if (!documentCommentsLoading) {
      console.log("COMMENT DATA:", documentCommentsData);
    }
  }, [documentCommentsLoading, documentCommentsData]);

  useEffect(() => {
    console.log(userData);
  });

  return (
    <Box
      bg={colorMode === "light" ? "gray.100" : "gray.700"}
      rounded={"lg"}
      p={4}
      my={2}
    >
      <Text fontWeight={"bold"} fontSize={"xl"} mb={2}>
        Comments
      </Text>
      <Box mb={2}>
        <CommentRichTextEditor
          userData={userData}
          documentId={documentID}
          refetchDocumentComments={refetchInterceptedFunction}
        />
        <Divider orientation="horizontal" colorScheme={"linkedin"} />
      </Box>
      {!isRepainting && !documentCommentsLoading ? (
        <AnimatePresence>
          <Grid gridTemplateColumns={"repeat(1,1fr)"}>
            {documentCommentsData.map((comment, index) => {
              // if (comment.is_public && !comment.is_removed) {
              return (
                <motion.div
                  key={index}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.5, delay: (index + 1) / 10 }}
                  style={{
                    height: "100%",
                    animation: "oscillate 8s ease-in-out infinite",
                  }}
                >
                  <CommentDisplayRTE
                    refetchComments={refetchInterceptedFunction}
                    documentPk={documentID}
                    commentPk={comment?.pk}
                    user={comment.user}
                    payload={comment.text}
                    created_at={comment.created_at}
                    updated_at={comment.updated_at}
                  />
                </motion.div>
              );
              // }
            })}
          </Grid>
        </AnimatePresence>
      ) : (
        <Center my={4}>
          <Spinner />
        </Center>
      )}
    </Box>
  );
};

// <AnimatePresence>
// <Grid gridTemplateColumns={"repeat(1,1fr)"}>
//     {data.map((u: any, i: number) => (
//         <motion.div
//             key={i}
//             initial={{ y: -10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 10, opacity: 0 }}
//             transition={{ duration: 0.5, delay: (i + 1) / 10 }}
//             style={{
//                 height: "100%",
//                 animation: "oscillate 8s ease-in-out infinite",
//             }}
//         >
//           </motion.div>
