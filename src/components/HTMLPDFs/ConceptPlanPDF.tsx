import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import useDistilledHtml from "@/lib/hooks/helper/useDistilledHtml";
import { useGetConceptPlanData } from "@/lib/hooks/helper/useGetConceptPlanData";
import useServerImageUrl from "@/lib/hooks/helper/useServerImageUrl";
import { Box } from "@chakra-ui/react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  // Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { useEffect } from "react";
import { FcCancel } from "react-icons/fc";
import { GiConfirmed } from "react-icons/gi";
import { useFormattedDate } from "../../lib/hooks/helper/useFormattedDate";
import { replaceDarkWithLight } from "@/lib/hooks/helper/replaceDarkWithLight";

interface IProps {
  concept_plan_pk: number;
}

export const ConceptPlanPDF = ({ concept_plan_pk }: IProps) => {
  const {
    conceptPlanData,
    conceptPlanDataLoading,
    // refetchCPData
  } = useGetConceptPlanData(concept_plan_pk);

  useEffect(() => {
    // if (!conceptPlanData) {
    //     refetchCPData();
    // }
    if (!conceptPlanDataLoading) {
      console.log(conceptPlanData);
    }
  }, [conceptPlanDataLoading, conceptPlanData]);

  const title = useDistilledHtml(conceptPlanData?.project_title);
  const formattedDate = useFormattedDate(conceptPlanData?.now);
  const imageUrl = useServerImageUrl(conceptPlanData?.project_image?.file);
  let baseUrl = useApiEndpoint();
  baseUrl = baseUrl.replace(":8000", ":3000");

  // function replaceDarkWithLight(htmlString) {
  //   // Replace 'dark' with 'light' in class attributes
  //   const modifiedHTML = htmlString.replace(
  //     /class\s*=\s*["']([^"']*dark[^"']*)["']/gi,
  //     (match, group) => {
  //       return `class="${group.replace(/\bdark\b/g, "light")}"`;
  //     }
  //   );

  //   // Add margin-right: 4px to all <li> elements
  //   const finalHTML = modifiedHTML.replace(
  //     /<li/g,
  //     '<li style="margin-left: 36px;"'
  //   );

  //   return finalHTML;
  // }

  return (
    <>
      <Html>
        <Head />
        <Tailwind>
          <Body className="mx-auto my-auto bg-white px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[190mm] rounded p-[20px]">
              <Text className="mb-14 mt-10 text-center">
                Document Current as of {formattedDate}
              </Text>

              <Img
                src={`${imageUrl}`}
                width="100%"
                alt="Project Image"
                className="mx-auto my-0 rounded-2xl"
              />
              <Heading className="mx-0 my-[30px] mt-10 p-0 text-center text-[24px] font-normal text-black">
                {title}
              </Heading>
              <Heading className="mx-0 my-[30px] mt-4 p-0 text-center text-[14px] font-bold text-black">
                {conceptPlanData?.document_tag}
              </Heading>

              <Heading className="mx-0 my-[30px] mt-2 p-0 text-center text-[14px] font-bold text-black">
                {conceptPlanData?.business_area_name}
              </Heading>

              <Heading className="mx-0 mt-2 mt-20 p-0 text-center text-[14px] font-bold text-black">
                Team
              </Heading>

              <Heading className="mx-0 my-[30px] mt-10 p-0 text-center text-[14px] text-black">
                {conceptPlanData?.project_team?.join(", ")}
              </Heading>

              <table className="mt-40 w-full">
                <tr className="">
                  <td className="py-2">
                    <Text className="m-0 text-right text-[14px] font-bold text-black">
                      Project Lead Approval
                    </Text>
                  </td>
                  <td className="flex items-center justify-center py-2">
                    {conceptPlanData?.project_lead_approval_granted === true ? (
                      <Box color={"green.500"}>
                        <GiConfirmed size={"30px"} />
                      </Box>
                    ) : (
                      <Box color={"red.500"}>
                        <FcCancel size={"30px"} />
                      </Box>
                    )}
                  </td>
                </tr>
                <tr className="">
                  <td className="py-2">
                    <Text className="m-0 text-right text-[14px] font-bold text-black">
                      Business Area Lead Approval
                    </Text>
                  </td>
                  <td className="flex items-center justify-center py-2">
                    {conceptPlanData?.business_area_lead_approval_granted ===
                    true ? (
                      <Box color={"green.500"}>
                        <GiConfirmed size={"30px"} />
                      </Box>
                    ) : (
                      <Box color={"red.500"}>
                        <FcCancel size={"30px"} />
                      </Box>
                    )}

                    {/* <img
                                            src={conceptPlanData?.business_area_lead_approval_granted === true ? '/public/Approved.png' : '/public/NotApproved.png'}
                                            width="30px"
                                            height="30px"
                                            alt="Project Image"
                                        /> */}
                  </td>
                </tr>
                <tr className="">
                  <td className="py-2">
                    <Text className="m-0 text-right text-[14px] font-bold text-black">
                      Directorate Approval
                    </Text>
                  </td>
                  <td className="flex items-center justify-center py-2">
                    {conceptPlanData?.directorate_approval_granted === true ? (
                      <Box color={"green.500"}>
                        <GiConfirmed size={"30px"} />
                      </Box>
                    ) : (
                      <Box color={"red.500"}>
                        <FcCancel size={"30px"} />
                      </Box>
                    )}
                  </td>
                </tr>
              </table>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Background:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.background || "",
                    ),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Aims:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(conceptPlanData?.aims || ""),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Expected Outcomes:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.expected_outcomes || "",
                    ),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Strategic Context:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.strategic_context || "",
                    ),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Expected Collaborations:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.collaborations || "",
                    ),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Staff Time Allocation:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.staff_time_allocation || "",
                    ),
                  }}
                />
              </Section>

              <Section className="my-[32px] max-w-[190mm]">
                <Heading className="mx-0 my-[30px] mt-2 p-0 text-[14px] font-bold text-black">
                  Budget:
                </Heading>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceDarkWithLight(
                      conceptPlanData?.indicative_operating_budget || "",
                    ),
                  }}
                />
              </Section>

              <Section className="mb-[32px] mt-[32px] text-right">
                <Button
                  className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                  href={`${baseUrl}/projects/${conceptPlanData?.project_pk}/concept`}
                >
                  View Document
                </Button>
              </Section>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
              <Text className="text-[12px] leading-[24px] text-[#666666]">
                This automated message was intended for{" "}
                <span className="text-black">Jarid Prince</span>. If you believe
                this was sent by mistake, you can ignore this email.
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    </>
  );
};
