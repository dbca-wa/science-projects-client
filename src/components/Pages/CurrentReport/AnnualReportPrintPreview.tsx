import { IReport } from "@/types";
import { Box, Center, Divider, Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { GeneratePDFButton } from "../Reports/GeneratePDFButton";
import { CoverPageSection } from "./PrintPreviewSections/CoverPageSection";
import { DirectorsMessageSection } from "./PrintPreviewSections/DirectorsMessageSection";
import { ServiceDeliverySection } from "./PrintPreviewSections/ServiceDeliverySection";

interface IPrintPreviewProps {
    thisReport: IReport;
}

export const AnnualReportPrintPreview = (
    { thisReport }: IPrintPreviewProps
) => {

    const [currentSection, setCurrentSection] = useState("cover")
    const sectionDictionary = {
        "cover": "Cover Page",
        "dm": "Director's Message",
        "contents": "Contents", // table of contents
        "sds": "Service Delivery Structure",
        "progress": "Progress Reports", // subsections for each business area
        "external_summary": "External Partnerships", //table with title
        "student_summary": "Student Projects", // table with title
        "student_progress": "Student Reports",
        "publications": "Publications and Reports",
        "summary": "Summary of Research Projects",  // table with title
    }

    return (
        <Flex w={"100%"} h={"100%"} minH={"670px"} flexDir={"column"}>
            <TopSection currentSectionTitle={sectionDictionary[currentSection]} thisReport={thisReport} />
            {/* <Divider orientation="horizontal" my={2} /> */}
            <Flex
                h={"100%"}
                w={"100%"}
                mt={4}
                // bg={"orange"}
                flex={1}
            >
                <PageDisplay sectionDictionary={sectionDictionary} currentSection={currentSection} thisReport={thisReport} />

                <SectionSidebar sectionDictionary={sectionDictionary} setCurrentSection={setCurrentSection} />
            </Flex>
        </Flex>
    );
};


interface ITopSectionProps {
    currentSectionTitle: string;
    thisReport: IReport;
}

const TopSection = ({ currentSectionTitle, thisReport }: ITopSectionProps) => {
    const { colorMode } = useColorMode();
    return (

        <Flex justifyContent={"space-between"}
        >
            <Box
                // textAlign={"center"}
                justifyContent={"center"}
                flex={1}
                alignSelf={"center"}
            >
                <Text
                    // bg={"pink"}
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                    color={colorMode === "light" ? "blue.500" : "blue.400"}
                >
                    {currentSectionTitle}
                </Text>
            </Box>

            <HStack justifyContent={"flex-end"}>
                <GeneratePDFButton report={thisReport} />
            </HStack>
        </Flex>

    )
}

interface IPageProps {
    sectionDictionary: Record<string, string>;
    currentSection?: string;
    setCurrentSection?: React.Dispatch<React.SetStateAction<string>>;
    thisReport?: IReport;
}

const PageDisplay = ({ sectionDictionary, currentSection, thisReport }: IPageProps) => {


    return (
        <Flex flex={1}
            // bg={"pink"}
            alignContent={"center"}
            mt={-14}
        >
            <Box
                flex={1}
                alignItems={"center"}
                justifyContent={"center"}
                bg={"gray.400"}
                border={"1px solid"}
                borderColor={"gray.300"}
            >
                <PageSplitterComponent>
                    {currentSection === "cover" &&
                        (
                            <CoverPageSection year={thisReport?.year} />
                        )}
                    {currentSection === "dm" &&
                        (
                            <DirectorsMessageSection dm={thisReport?.dm} />
                        )}
                    {currentSection === "sds" && (
                        <ServiceDeliverySection intro={thisReport?.service_delivery_intro} />

                    )}
                </PageSplitterComponent>

            </Box>

            <Divider orientation="vertical" px={2} />
        </Flex>

    )
}

interface IPageSplitterProps {
    children: ReactNode;
}
const PageSplitterComponent = ({ children }: IPageSplitterProps) => {

    const A4WIDTH = 210; //mm
    const A4HEIGHT = 297; //mm
    const MARGINSIZE = 25; //mm

    const [currentPage, setCurrentPage] = useState<number>(1);

    return (
        <Center
            margin={'auto'}
            w={"100%"}
        >
            {/* Page stylingsa */}
            <Box
                bg={"gray.50"}
                padding={`${MARGINSIZE}mm`}
                minH={`${A4HEIGHT}mm`}
                // maxH={`${A4HEIGHT}mm`}
                minW={`${A4WIDTH}mm`}

                maxW={`${A4WIDTH}mm`}
                pos={"relative"}
                justifyContent={"center"}
            >
                {/* Content area after margins */}
                <Box

                >
                    {children}

                </Box>
            </Box>
            {/* <Text>Page Display for {sectionDictionary[currentSection]}</Text> */}

        </Center>
    )
}

const SectionSidebar = ({ sectionDictionary, setCurrentSection }: IPageProps) => {


    return (
        <Flex
            // flex={}
            flexDir={"column"}
            w={"160px"}
            textAlign={"end"}
        >
            {Object.entries(sectionDictionary).map((section) => {
                return (
                    <Text
                        userSelect={"none"}
                        color={section[0] === "contents" ? "gray.400" : "blue.500"}
                        fontWeight={"semibold"}
                        fontSize={"large"}
                        onClick={section[0] !== "contents" ? () => setCurrentSection(section[0]) : undefined}
                        cursor={section[0] === "contents" ? undefined : "pointer"}
                        _hover={
                            section[0] !== "contents" ?
                                {
                                    textDecoration: "underline"
                                } : undefined
                        }
                    >
                        {section[1]}
                    </Text>
                )
            })
            }
        </Flex>
    )
}

