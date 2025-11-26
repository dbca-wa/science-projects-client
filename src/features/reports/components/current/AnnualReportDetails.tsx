// Incomplete section to handle the filling and viewing of the Annual Report Details

import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
// import { updateReport } from "@/shared/lib/api";
import { useGetFullLatestReport } from "@/features/reports/hooks/useGetFullLatestReport";
// import { useGetLatestReportMedia } from "@/shared/hooks/useGetLatestReportMedia";
import { useUser } from "@/features/users/hooks/useUser";
import type { IReport } from "@/shared/types";
import {
  Box,
  Center,
  FormControl,
  Input,
  Spinner,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export const AnnualReportDetails = () => {
  // const toast = useToast();
  const { register } = useForm<IReport>();

  const { userData } = useUser();
  const { colorMode } = useColorMode();
  const documentType = "annualreport";
  const editorKey = colorMode + documentType;
  // const queryClient = useQueryClient();

  const { reportData, reportLoading } = useGetFullLatestReport();

  // const updateMutation = useMutation(updateReport, {
  //   onSuccess: () => {
  //     toast({
  //       status: "success",
  //       title: "Updated",
  //       position: "top-right",
  //     });
  //     queryClient.invalidateQueries(["reports"]);
  //   },
  //   onError: () => {
  //     toast({
  //       status: "error",
  //       title: "Failed",
  //       position: "top-right",
  //     });
  //   },
  // });

  // const onUpdateSubmit = (formData: IReport) => {
  //   // console.log(formData);
  //   updateMutation.mutate(formData);
  // };

  // const A4Width = 210; // in millimeters
  // const A4Height = A4Width * 1.414; // 1.414 is the aspect ratio of A4 paper (297 / 210)

  return (
    <Box>
      {reportLoading || !reportData ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Center flexDir={"column"}>
          <VStack
            p={6}
            spacing={6}
            //  w={`${A4Width}mm`}
            w="100%"
          >
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={reportData?.pk ? reportData.pk : reportData?.id} // Prefill with the 'pk' prop
            />
            <Input
              {...register("year", { required: true })}
              disabled
              required
              type="hidden"
              defaultValue={reportData.year} // Prefill with the 'name' prop
            />

            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`dm${editorKey}`} // Change the key to force a re-render
                data={reportData?.dm}
                section={"dm"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>

            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`dm_sign${editorKey}`} // Change the key to force a re-render
                data={reportData?.dm_sign}
                section={"dm_sign"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>

            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`service_delivery_intro${editorKey}`} // Change the key to force a re-render
                data={reportData?.service_delivery_intro}
                section={"service_delivery_intro"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>
            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`research_intro${editorKey}`} // Change the key to force a re-render
                data={reportData?.research_intro}
                section={"research_intro"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>

            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`student_intro${editorKey}`} // Change the key to force a re-render
                data={reportData?.student_intro}
                section={"student_intro"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>

            <FormControl>
              <RichTextEditor
                canEdit={userData?.is_superuser}
                isUpdate={true}
                editorType="AnnualReport"
                key={`publications${editorKey}`} // Change the key to force a re-render
                data={reportData?.publications}
                section={"publications"}
                writeable_document_kind={"Annual Report"}
                writeable_document_pk={reportData?.id}
              />
            </FormControl>
          </VStack>
        </Center>
      )}
    </Box>
  );
};
