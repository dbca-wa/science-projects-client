import { CommentRichTextEditor } from "@/shared/components/RichTextEditor/Editors/CommentRichTextEditor";
import { CommentDisplayRTE } from "@/shared/components/RichTextEditor/Editors/Sections/CommentDisplayRTE";
import { useBranches } from "@/features/admin/hooks/useBranches";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { useGetDocumentComments } from "@/features/documents/hooks/useGetDocumentComments";
import type { IMainDoc, IProjectData, IUserData, IUserMe } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Separator } from "@/shared/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/component.utils";
import { Loader2 } from "lucide-react";

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
    <div
      className={cn(
        "rounded-lg p-4 my-2",
        colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
      )}
    >
      <div className="flex flex-col items-center justify-between">
        <h2 className="font-bold text-xl mb-2">Comments</h2>
        <p className="font-semibold text-xs text-gray-500">
          Type @ followed by a user's name to mention them. An email will be
          sent to mentioned users. Note: You can mention team members, BA leads,
          and admin.
        </p>
      </div>
      <div className="mt-4 mb-2">
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
      </div>
      {!isRepainting && !documentCommentsLoading ? (
        <>
          {documentCommentsData.length >= 1 ? (
            <div className="mb-4">
              <Separator orientation="horizontal" />
            </div>
          ) : null}

          <AnimatePresence>
            <div className="grid grid-cols-1">
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
            </div>
          </AnimatePresence>
        </>
      ) : (
        <div className="flex justify-center items-center my-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
};
