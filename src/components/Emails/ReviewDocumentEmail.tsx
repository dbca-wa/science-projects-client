import { IUserMe } from "@/types";
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

interface Props {
  userData: IUserMe;
}

export const ReviewDocumentEmail = ({ userData }: Props) => {
  const PRODUCTION_BACKEND_BASE_URL = import.meta.env.PRODUCTION_BACKEND_BASE_URL

  return (
    <Html>
      <Head />
      <Preview>SPMS: Review Document</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className=" rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            {/* border border-solid border-[#eaeaea] */}
            <Section className="mt-[32px]">
              <Img
                src={`/dbca.jpg`}
                width="180"
                height="107"
                alt="DBCA"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mt-4 mx-0">
              {/* Join <strong>{teamName}</strong> on <strong>Vercel</strong> */}
              Review Project Document
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {/* Hello {username}, */}
              Hello {userData?.first_name} {userData?.last_name},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              {/* <strong>{invitedByUsername}</strong>  */}
              <strong>Jarid Prince</strong> (
              <Link
                // href={`mailto:${invitedByEmail}`}
                href={`mailto:jarid.prince@dbca.wa.gov.au`}
                className="text-blue-600 no-underline"
              >
                {/* {invitedByEmail} */}
                jarid.prince@dbca.wa.gov.au
              </Link>
              ) has submitted a document for approval on your project{" "}
              <strong>'{"Some Project"}'</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                // href={inviteLink}
                href={PRODUCTION_BACKEND_BASE_URL}
              >
                {/* Join the team */}
                Review Document
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Click the link above to visit the Science Project Management
              System (SPMS) and review the document.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This automated message was intended for{" "}
              <span className="text-black">
                {userData?.first_name} {userData?.last_name}
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
export default ReviewDocumentEmail;
