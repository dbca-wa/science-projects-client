import { Body, Button, Container, Head, Html, Preview, Tailwind, Text, Heading, Link, Img, Section, Row, Column, Hr, } from "@react-email/components";

export const TestEmail = () => {
    return (
        <Html>
            <Head />
            <Preview>Some preview text</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className=" rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        {/* border border-solid border-[#eaeaea] */}
                        {/* <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/vercel-logo.png`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section> */}
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            {/* Join <strong>{teamName}</strong> on <strong>Vercel</strong> */}
                            Review Project
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
                            ) has submitted a document for approval on project <strong>{"niasduhiad"}</strong>.
                        </Text>
                        {/* <Section>
              <Row>
                <Column align="right">
                  <Img
                    className="rounded-full"
                    src={userImage}
                    width="64"
                    height="64"
                  />
                </Column>
                <Column align="center">
                  <Img
                    src={`${baseUrl}/static/vercel-arrow.png`}
                    width="12"
                    height="9"
                    alt="invited you to"
                  />
                </Column>
                <Column align="left">
                  <Img
                    className="rounded-full"
                    // src={teamImage}
                    src={}
                    width="64"
                    height="64"
                  />
                </Column>
              </Row>
            </Section> */}
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                // href={inviteLink}
                                href={"https://scienceprojects-test.dbca.wa.gov.au"}
                            >
                                {/* Join the team */}
                                https://scienceprojects-test.dbca.wa.gov.au
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link
                                href={"https://scienceprojects-test.dbca.wa.gov.au"}
                                //   href={inviteLink} 
                                className="text-blue-600 no-underline">
                                {/* {inviteLink} */} https://scienceprojects-test.dbca.wa.gov.au
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This automated message was intended for{" "}
                            <span className="text-black">Jarid Prince
                                {/* {username} */}
                            </span>. If you
                            were not expecting this message, you can ignore this email.
                        </Text>
                    </Container>

                </Body>

            </Tailwind>

        </Html>
    )
}
export default TestEmail;
