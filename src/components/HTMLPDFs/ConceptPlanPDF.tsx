import useDistilledHtml from "@/lib/hooks/useDistilledHtml";
import { useGetConceptPlanData } from "@/lib/hooks/useGetConceptPlanData";
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import { useEffect } from "react";
import { useFormattedDate } from './../../lib/hooks/useFormattedDate';
import useServerImageUrl from "@/lib/hooks/useServerImageUrl";
import { GiConfirmed } from "react-icons/gi";
import { FcCancel } from "react-icons/fc";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";
import { Box } from "@chakra-ui/react";

interface IProps {
    concept_plan_pk: number;
}


export const ConceptPlanPDF = ({ concept_plan_pk }: IProps) => {

    const { conceptPlanData, conceptPlanDataLoading, refetchCPData } = useGetConceptPlanData(concept_plan_pk);

    useEffect(() => {
        // if (!conceptPlanData) {
        //     refetchCPData();
        // }
        if (!conceptPlanDataLoading) {
            console.log(conceptPlanData);
        }
    }, [conceptPlanDataLoading, conceptPlanData])


    const title = useDistilledHtml(conceptPlanData?.project_title);
    const formattedDate = useFormattedDate(conceptPlanData?.now);
    const imageUrl = useServerImageUrl(conceptPlanData?.project_image?.file)
    let baseUrl = useApiEndpoint();
    baseUrl = baseUrl.replace(':8000', ':3000');

    function replaceDarkWithLight(htmlString) {
        // Replace 'dark' with 'light' in class attributes
        const modifiedHTML = htmlString.replace(/class\s*=\s*["']([^"']*dark[^"']*)["']/gi, (match, group) => {
            return `class="${group.replace(/\bdark\b/g, 'light')}"`
        });

        // Add margin-right: 4px to all <li> elements
        const finalHTML = modifiedHTML.replace(/<li/g, '<li style="margin-left: 36px;"');

        return finalHTML;
    }




    return (
        <>
            <Html>
                <Head />
                {/* <Preview>SPMS: Document Approved</Preview> */}
                <Tailwind>
                    <Body className="bg-white my-auto mx-auto font-sans px-2">
                        <Container className=" rounded my-[40px] mx-auto p-[20px] max-w-[190mm]">
                            {/* border border-solid border-[#eaeaea] */}
                            <Text className="text-center mt-10 mb-14">Document Current as of {formattedDate}</Text>



                            <Img
                                src={`${imageUrl}`}
                                width="100%"
                                // height="107"
                                alt="Project Image"
                                className="my-0 mx-auto rounded-2xl"
                            />
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mt-10 mx-0">
                                {title}
                            </Heading>
                            <Heading className="text-black text-[14px] font-bold text-center p-0 my-[30px] mt-4 mx-0">
                                {conceptPlanData?.document_tag}
                            </Heading>

                            <Heading className="text-black text-[14px] font-bold text-center p-0 my-[30px] mt-2 mx-0">
                                {conceptPlanData?.business_area_name}
                            </Heading>

                            <Heading className="text-black text-[14px] font-bold text-center p-0 mt-2 mx-0  mt-20">
                                Team
                            </Heading>

                            <Heading className="text-black text-[14px] p-0 my-[30px] text-center mt-10 mx-0">
                                {conceptPlanData?.project_team?.join(', ')}
                            </Heading>



                            <table className="w-full mt-40">
                                <tr className="">
                                    <td className="py-2">
                                        <Text className="text-black text-[14px] m-0 font-bold text-right">
                                            Project Lead Approval
                                        </Text>
                                    </td>
                                    <td className="py-2 flex items-center justify-center">
                                        {conceptPlanData?.project_lead_approval_granted === true ? <Box color={"green.500"}><GiConfirmed size={"30px"} /></Box> : <Box color={"red.500"}><FcCancel size={"30px"} /></Box>}
                                        {/* <img
                                            src={
                                            width="30px"
                                            height="30px"
                                            alt="Project Image"
                                        /> */}
                                    </td>
                                </tr>
                                <tr className="">
                                    <td className="py-2">
                                        <Text className="text-black text-[14px] m-0 font-bold text-right">
                                            Business Area Lead Approval
                                        </Text>
                                    </td>
                                    <td className="py-2 flex items-center justify-center">
                                        {conceptPlanData?.business_area_lead_approval_granted === true ? <Box color={"green.500"}><GiConfirmed size={"30px"} /></Box> : <Box color={"red.500"}><FcCancel size={"30px"} /></Box>}

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
                                        <Text className="text-black text-[14px] m-0 font-bold text-right">
                                            Directorate Approval
                                        </Text>
                                    </td>
                                    <td className="py-2 flex items-center justify-center">
                                        {conceptPlanData?.directorate_approval_granted === true ? <Box color={"green.500"}><GiConfirmed size={"30px"} /></Box> : <Box color={"red.500"}><FcCancel size={"30px"} /></Box>}
                                        {/* <img
                                            src={conceptPlanData?.directorate_approval_granted !== true ? '/public/Approved.png' : '/public/NotApproved.png'}
                                            width="30px"
                                            height="30px"
                                            alt="Project Image"
                                        /> */}
                                    </td>
                                </tr>
                            </table>



                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">

                                    Background:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.background || '') }} />

                            </Section>




                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Aims:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.aims || '') }} />
                            </Section>



                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Expected Outcomes:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.expected_outcomes || '') }} />
                            </Section>




                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Strategic Context:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.strategic_context || '') }} />
                            </Section>



                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Expected Collaborations:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.collaborations || '') }} />
                            </Section>


                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >

                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Staff Time Allocation:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.staff_time_allocation || '') }} />
                            </Section>


                            <Section
                                className="my-[32px] max-w-[190mm]"
                            >
                                <Heading className="text-black text-[14px] font-bold p-0 my-[30px] mt-2 mx-0">
                                    Budget:
                                </Heading>
                                <div dangerouslySetInnerHTML={{ __html: replaceDarkWithLight(conceptPlanData?.indicative_operating_budget || '') }} />
                            </Section>


                            <Section className="text-right mt-[32px] mb-[32px]">
                                <Button
                                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                    // href={inviteLink}
                                    href={`${baseUrl}/projects/${conceptPlanData?.project_pk}/concept`}
                                >
                                    {/* Join the team */}
                                    View Document
                                </Button>
                            </Section>

                            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                This automated message was intended for{" "}
                                <span className="text-black">
                                    Jarid Prince
                                    {/* {username} */}
                                </span>
                                . If you believe this was sent by mistake, you can ignore this
                                email.
                            </Text>
                        </Container>
                    </Body>
                </Tailwind>
            </Html>

        </>
    )
}