import type { IUserMe } from "@/shared/types";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
} from "@react-email/components";

interface Props {
  userData: IUserMe;
}

export const NewCycleOpenEmail = ({ userData }: Props) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  return (
    <Html>
      <Head />
      <Preview>SPMS: New Reporting Cycle Open</Preview>
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
              {/* Join <strong>{teamName}</strong> on <strong>Vercel</strong> */}
              New Reporting Cycle Open
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {/* Hello {username}, */}
              Hello {userData?.display_first_name ?? userData?.first_name}{" "}
              {userData?.display_last_name ?? userData?.last_name},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              {/* <strong>{invitedByUsername}</strong>  */}
              The annual reporting cycle for <strong>20XX-20YY</strong> is open.
              All active and approved projects now have a new progress report to
              complete.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                // href={inviteLink}
                href={VITE_PRODUCTION_BASE_URL}
              >
                {/* Join the team */}
                Visit Dashboard
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              Click the link above to visit the Science Project Management
              System and see what needs to be updated.
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
export default NewCycleOpenEmail;
