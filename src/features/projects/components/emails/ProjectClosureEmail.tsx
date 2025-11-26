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

export const ProjectClosureEmail = ({ userData }: Props) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  return (
    <Html>
      <Head />
      <Preview>SPMS: Project Closed</Preview>
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
              Project Closed
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {/* Hello {username}, */}
              Hello {userData?.display_first_name ?? userData?.first_name}{" "}
              {userData?.display_last_name ?? userData?.last_name},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Closure of your project <strong>'Some Project'</strong> has been
              approved. This project will no longer require progress report
              updates.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                // href={inviteLink}
                href={VITE_PRODUCTION_BASE_URL}
              >
                {/* Join the team */}
                View Project
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              The project can still be viewed, edited, and reactivated by
              following the link above.
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
export default ProjectClosureEmail;
