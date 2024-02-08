import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
} from "@react-email/components";

export const DocumentSentBackEmail = () => {
  return (
    <Html>
      <Head />
      <Preview>SPMS: Document Sent Back</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className=" rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            {/* border border-solid border-[#eaeaea] */}
            <Section className="mt-[32px]">
              <Img
                src={`/dbca.jpg`}
                width="120"
                height="107"
                alt="DBCA"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mt-4 mx-0">
              {/* Join <strong>{teamName}</strong> on <strong>Vercel</strong> */}
              Document Sent Back
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {/* Hello {username}, */}
              Hello Jarid Prince,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              A document you submitted for your project{" "}
              <strong>'Some Project'</strong> has been sent back to you. Please
              review and edit the document before resubmitting for approval.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                // href={inviteLink}
                href={"https://scienceprojects-test.dbca.wa.gov.au"}
              >
                {/* Join the team */}
                Revise Document
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              You can revise the document by following the link above.
            </Text>
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
  );
};
export default DocumentSentBackEmail;
