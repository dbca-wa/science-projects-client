import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Tailwind, Text, Img } from "@react-email/components";

export const NewCycleOpenEmail = () => {
    return (
        <Html>
            <Head />
            <Preview>Some preview text</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className=" rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        {/* border border-solid border-[#eaeaea] */}
                        <Section className="mt-[32px]">
                            <Img
                                src={`/dbca.jpg`}
                                width="120"
                                height="107"
                                alt="Vercel"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mt-4 mx-0">
                            {/* Join <strong>{teamName}</strong> on <strong>Vercel</strong> */}
                            New Reporting Cycle Open
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {/* Hello {username}, */}
                            Hello Jarid Prince,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {/* <strong>{invitedByUsername}</strong>  */}
                            <strong>Rory McAuley</strong> (
                            <Link
                                // href={`mailto:${invitedByEmail}`}
                                href={`mailto:rory.mcauley@dbca.wa.gov.au`}
                                className="text-blue-600 no-underline"
                            >
                                {/* {invitedByEmail} */}
                                rory.mcauley@dbca.wa.gov.au
                            </Link>
                            ) has just opened the new reporting cycle. All active and approved projects now have a new progress report to fill out.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                // href={inviteLink}
                                href={"https://scienceprojects-test.dbca.wa.gov.au"}
                            >
                                {/* Join the team */}
                                Visit Dashboard
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Click the link above to visit the Science Project Management System and see what needs to be updated.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This automated message was intended for{" "}
                            <span className="text-black">Jarid Prince
                                {/* {username} */}
                            </span>. If you believe this was sent by mistake, you can ignore this email.
                        </Text>
                    </Container>

                </Body>

            </Tailwind>

        </Html>
    )
}
export default NewCycleOpenEmail;
