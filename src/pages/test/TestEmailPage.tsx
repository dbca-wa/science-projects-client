import { Head } from "@/shared/components/layout/base/Head";
import DivisionalEmailLists from "@/features/admin/components/emails/DivisionalEmailLists";
// import EmailStylingPage from "@/shared/components/Modals/Emails/EmailStylingPage"; // Component does not exist
import { useMaintainer } from "@/features/admin/hooks/useMaintainer";
import { useUser } from "@/features/users/hooks/useUser";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

export const TestEmailPage = () => {
  const { userLoading, userData } = useUser();
  const { maintainerData, maintainerLoading } = useMaintainer();

  const isMaintainer =
    !userLoading && !maintainerLoading && maintainerData?.pk === userData?.pk;

  if (userLoading || !userData || maintainerLoading || !maintainerData) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <>
      <Head title="Emails" />
      <Tabs defaultValue="divisional-lists">
        <TabsList>
          <TabsTrigger value="divisional-lists">Divisional Directorate Email Lists</TabsTrigger>
          {/* {isMaintainer ? <TabsTrigger value="email-styling">Email Styling Page</TabsTrigger> : null} */}
          {/* <TabsTrigger value="templates">Templates</TabsTrigger> */}
        </TabsList>
        <TabsContent value="divisional-lists">
          <DivisionalEmailLists />
        </TabsContent>
        {/* {isMaintainer ? (
          <TabsContent value="email-styling">
            <EmailStylingPage />
          </TabsContent>
        ) : null} */}
      </Tabs>
    </>
  );
};
