import { IUserMe } from "@/types";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Link,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  userData: IUserMe;
}

export const DocumentRecalledEmail = ({ userData }: Props) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  return (
    <Html>
      <Head />
      <Preview>SPMS: Document Recalled</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded p-[20px]">
            {/* border border-solid border-[#eaeaea] */}
            <Section className="mt-[32px]">
              <Img
                src={`/dbca.jpg`}
                width="180"
                height="107"
                alt="DBCA"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] mt-4 p-0 text-center text-[24px] font-normal text-black">
              Document Recalled
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {/* Hello {username}, */}
              Hello {userData?.first_name} {userData?.last_name},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
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
              ) has recalled a document from approval for project{" "}
              <strong>'{"Some Project"}'</strong>.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                // href={inviteLink}
                href={VITE_PRODUCTION_BASE_URL}
              >
                {/* Join the team */}
                View Document
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              You can view the document by clicking the button above.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
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
export default DocumentRecalledEmail;
