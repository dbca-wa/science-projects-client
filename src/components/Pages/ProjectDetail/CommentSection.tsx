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
import { useBranches } from "@/lib/hooks/useBranches";
import { useBusinessAreas } from "@/lib/hooks/useBusinessAreas";

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
    if (!documentCommentsLoading && isRepainting) {
      setIsRepainting(false);
    }
  }, [documentCommentsLoading, isRepainting]);

  const branches = useBranches();
  const businessAreas = useBusinessAreas();

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
          branches={branches?.branchesData}
          businessAreas={businessAreas?.baData}
        />
      </Box>
      {!isRepainting && !documentCommentsLoading ? (
        <>
          {documentCommentsData.length >= 1 ? (
            <Box mb={4}>
              <Divider orientation="horizontal" colorScheme={"linkedin"} />
            </Box>
          ) : null}

          <AnimatePresence>
            <Grid gridTemplateColumns={"repeat(1,1fr)"}>
              {documentCommentsData?.map((comment, index) => {
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
                      branches={branches?.branchesData}
                      businessAreas={businessAreas?.baData}
                      reactions={comment.reactions}
                    />
                  </motion.div>
                );
                // }
              })}
            </Grid>
          </AnimatePresence>
        </>
      ) : (
        <Center my={4}>
          <Spinner />
        </Center>
      )}
    </Box>
  );
};
