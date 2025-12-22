// Used to display the tasks and projects of a user in the traditional layout

import { useGetEndorsementsPendingMyAction } from "@/features/documents/hooks/useGetEndorsementsPendingMyAction";
import { useGetPendingAdminTasks } from "@/features/admin/hooks/useGetPendingAdminTasks";
import { useGetPendingCaretakerTasks } from "@/features/users/hooks/useGetPendingCaretakerTasks";
import { useUser } from "@/features/users/hooks/useUser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { AiFillProject } from "react-icons/ai";
import { FcHighPriority, FcOk } from "react-icons/fc";
import { useGetDocumentsPendingMyAction } from "@/features/documents/hooks/useGetDocumentsPendingMyAction";
import { useGetMyProjects } from "@/features/projects/hooks/useGetMyProjects";
import { AdminTasksDataTable } from "./AdminTasksDataTable";
import { DocumentsDataTable } from "./DocumentsDataTable";
import { EndorsementsDataTable } from "./EndorsementsDataTable";
import { UserProjectsDataTable } from "./UserProjectsDataTable";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const TraditionalTasksAndProjects = () => {
  const { colorMode } = useColorMode();
  const me = useUser();
  // console.log(me);
  // useEffect(() => console.log(me));
  const { projectData, projectsLoading } = useGetMyProjects();
  // useEffect(() => console.log(projectData));

  const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } =
    useGetDocumentsPendingMyAction();

  const { pendingEndorsementsData, pendingEndorsementsDataLoading } =
    useGetEndorsementsPendingMyAction();

  // useEffect(() => {
  //   if (!pendingProjectDocumentDataLoading) {
  //     console.log(pendingProjectDocumentData);
  //   }
  // }, [pendingProjectDocumentData, pendingProjectDocumentDataLoading]);

  // const pendingAdminActionsLoading = true;
  const { pendingAdminTasksLoading, pendingAdminTaskData } =
    useGetPendingAdminTasks();

  const { pendingCaretakerTasksLoading, pendingCaretakerTaskData } =
    useGetPendingCaretakerTasks(me?.userData?.pk);

  // useEffect(() => {
  //   if (!pendingCaretakerTasksLoading) {
  //     console.log("Caretaker Data:");
  //     console.log(pendingCaretakerTaskData);
  //   }
  // }, [pendingCaretakerTasksLoading, pendingCaretakerTaskData]);

  // useEffect(() => {
  //   if (!pendingAdminTasksLoading) {
  //     console.log(pendingAdminTaskData);
  //   }
  // }, [pendingAdminTaskData, pendingAdminTasksLoading]);

  return (
    <>
      <div className="mt-6">
        <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
          {/* My Tasks */}

          {pendingProjectDocumentDataLoading ? (
            // null
            <div className="flex justify-center items-center my-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: pendingProjectDocumentDataLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                value="item-0"
                className={cn(
                  "border-b-0 border-t-0",
                  colorMode === "light" ? "border-black/50" : "border-white/60"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "select-none px-4 py-3 hover:no-underline",
                    colorMode === "light" 
                      ? "bg-gray-200 text-black hover:bg-gray-300" 
                      : "bg-gray-700 text-white hover:bg-gray-500"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1 text-left">My Tasks</span>
                    <div className="flex items-center mr-2">
                      {pendingProjectDocumentData?.all?.length >= 1 ? (
                        <div className="inline-flex justify-center items-center">
                          <div className="mr-2">
                            {pendingProjectDocumentData?.all?.length}
                          </div>
                          <FcHighPriority />
                        </div>
                      ) : (
                        <FcOk />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 select-none px-0 pt-0">
                  <DocumentsDataTable
                    pendingProjectDocumentData={pendingProjectDocumentData}
                  />
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          )}

          {/* Admin Tasks */}
          {me?.userData?.is_superuser === true ? (
            pendingAdminTasksLoading ? (
              <div className="flex justify-center items-center my-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
                animate={{
                  opacity: 1,
                }}
                transition={{ duration: 0.4 }} // Animation duration in seconds
              >
                <AccordionItem
                  value="item-1"
                  className={cn(
                    "border-b-0",
                    colorMode === "light" ? "border-black/50" : "border-white/60"
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "select-none px-4 py-3 hover:no-underline",
                      colorMode === "light" 
                        ? "bg-gray-200 text-black hover:bg-gray-300" 
                        : "bg-gray-700 text-white hover:bg-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex-1 text-left">Admin Tasks</span>
                      <div className="flex items-center mr-2">
                        {pendingAdminTaskData?.length >= 1 ? (
                          <div className="inline-flex justify-center items-center">
                            <div className="mr-2">{pendingAdminTaskData?.length}</div>
                            <FcHighPriority />
                          </div>
                        ) : (
                          <FcOk />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 select-none px-0 pt-0">
                    <AdminTasksDataTable
                      pendingAdminTaskData={pendingAdminTaskData}
                    />
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          ) : null}

          {/* Caretaker Tasks */}
          {me?.userData?.caretaking_for?.length > 0 ? (
            pendingCaretakerTasksLoading ? (
              <div className="flex justify-center items-center my-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
                animate={{
                  opacity: pendingCaretakerTasksLoading ? 0 : 1,
                }}
                transition={{ duration: 0.4 }} // Animation duration in seconds
              >
                <AccordionItem
                  value="item-2"
                  className={cn(
                    "border-b-0",
                    colorMode === "light" ? "border-black/50" : "border-white/60"
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "select-none px-4 py-3 hover:no-underline",
                      colorMode === "light" 
                        ? "bg-gray-200 text-black hover:bg-gray-300" 
                        : "bg-gray-700 text-white hover:bg-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex-1 text-left">Caretaker Tasks</span>
                      <div className="flex items-center mr-2">
                        {pendingCaretakerTaskData?.all?.length >= 1 ? (
                          <div className="inline-flex justify-center items-center">
                            <div className="mr-2">
                              {pendingCaretakerTaskData?.all?.length}
                            </div>
                            <FcHighPriority />
                          </div>
                        ) : (
                          <FcOk />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 select-none px-0 pt-0">
                    <DocumentsDataTable
                      pendingProjectDocumentData={pendingCaretakerTaskData}
                      isCaretakerTable
                    />
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          ) : null}

          {/* Endorsement Tasks */}
          {(me?.userData?.is_aec || me?.userData?.is_superuser) ===
          false ? null : pendingEndorsementsDataLoading ? (
            <div className="flex justify-center items-center my-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: pendingEndorsementsDataLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                value="item-3"
                className={cn(
                  "border-b-0",
                  colorMode === "light" ? "border-black/50" : "border-white/60"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "select-none px-4 py-3 hover:no-underline",
                    colorMode === "light" 
                      ? "bg-gray-200 text-black hover:bg-gray-300" 
                      : "bg-gray-700 text-white hover:bg-gray-500"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1 text-left">Endorsement Tasks</span>
                    <div className="flex items-center mr-2">
                      {pendingEndorsementsData?.aec?.length >=
                      // +
                      //   pendingEndorsementsData?.bm?.length +
                      //   pendingEndorsementsData?.hc?.length
                      1 ? (
                        <div className="inline-flex justify-center items-center">
                          <div className="mr-2">
                            {
                              pendingEndorsementsData?.aec?.length
                              // +
                              //   pendingEndorsementsData?.bm?.length +
                              //   pendingEndorsementsData?.hc?.length
                            }
                          </div>
                          <FcHighPriority />
                        </div>
                      ) : (
                        <FcOk />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 select-none px-0 pt-0">
                  <EndorsementsDataTable
                    pendingEndorsementsData={pendingEndorsementsData}
                  />
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          )}

          {/* My Projects */}
          {projectsLoading ? (
            <div className="flex justify-center items-center my-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: projectsLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                value="item-4"
                className={cn(
                  "border-b-0",
                  colorMode === "light" ? "border-black/50" : "border-white/60"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "select-none px-4 py-3 hover:no-underline",
                    colorMode === "light" 
                      ? "bg-gray-200 text-black hover:bg-gray-300" 
                      : "bg-gray-700 text-white hover:bg-gray-500"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1 text-left">My Projects</span>
                    <div className="flex items-center mr-2">
                      {projectData?.length >= 1 ? (
                        <div className="inline-flex justify-center items-center">
                          <div className="mr-2">{projectData?.length}</div>
                          <AiFillProject />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 select-none px-0 pt-0">
                  {!projectsLoading && (
                    <UserProjectsDataTable
                      projectData={projectData}
                      disabledColumns={{
                        business_area: true,
                        created_at: true,
                        title: false,
                        role: false,
                        kind: false,
                      }}
                      defaultSorting={"status"}
                      noDataString={"You aren't associated with any projects"}
                      filters
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          )}
        </Accordion>
      </div>
    </>
  );
};
