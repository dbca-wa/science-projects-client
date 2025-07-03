import { CommentRichTextEditor } from "@/components/RichTextEditor/Editors/CommentRichTextEditor";
import { CommentDisplayRTE } from "@/components/RichTextEditor/Editors/Sections/CommentDisplayRTE";
import { useBranches } from "@/lib/hooks/tanstack/useBranches";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { useGetDocumentComments } from "@/lib/hooks/tanstack/useGetDocumentComments";
import { IMainDoc, IProjectData, IUserData, IUserMe } from "@/types";
import {
  Box,
  Center,
  Divider,
  Grid,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  documentKind: string;
  userData: IUserMe;
  baseAPI: string;
  project: IProjectData;
}
export const CommentSection = ({
  documentID,
  documentKind,
  userData,
  baseAPI,
  project,
}: Props) => {
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
      <div className="flex flex-col items-center justify-between">
        <Text fontWeight={"bold"} fontSize={"xl"} mb={2}>
          Comments
        </Text>
        <Text fontWeight={"semibold"} fontSize={"xs"} textColor={"gray.500"}>
          Type @ followed by a user's name to mention them.
        </Text>
        <Text fontWeight={"semibold"} fontSize={"xs"} textColor={"gray.500"}>
          By default (no @ used) staff team members and the business area lead
          will be emailed with a link to the document.{" "}
        </Text>
      </div>
      <Box mt={4} mb={2}>
        <CommentRichTextEditor
          baseAPI={baseAPI}
          userData={userData}
          documentId={documentID}
          documentKind={documentKind}
          refetchDocumentComments={refetchInterceptedFunction}
          branches={branches?.branchesData}
          businessAreas={businessAreas?.baData}
          project={project}
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
                    key={comment?.pk}
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
                      baseAPI={baseAPI}
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
