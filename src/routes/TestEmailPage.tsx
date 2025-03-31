import { Head } from "@/components/Base/Head";
import DivisionalEmailLists from "@/components/Emails/DivisionalEmailLists";
import EmailStylingPage from "@/components/Modals/Emails/EmailStylingPage";
import { useMaintainer } from "@/lib/hooks/tanstack/useMaintainer";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Center,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";

export const TestEmailPage = () => {
  const { userLoading, userData } = useUser();
  const { maintainerData, maintainerLoading } = useMaintainer();

  const isMaintainer =
    !userLoading && !maintainerLoading && maintainerData?.pk === userData?.pk;

  if (userLoading || !userData || maintainerLoading || !maintainerData) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <>
      <Head title="Emails" />
      <Tabs>
        <TabList>
          <Tab>Divisional Directorate Email Lists</Tab>
          {isMaintainer ? <Tab>Email Styling Page</Tab> : null}

          {/* <Tab>Templates</Tab> */}
        </TabList>
        <TabPanels>
          <TabPanel>
            <DivisionalEmailLists />
          </TabPanel>
          {isMaintainer ? (
            <TabPanel>
              <EmailStylingPage />
            </TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>
    </>
  );
};
