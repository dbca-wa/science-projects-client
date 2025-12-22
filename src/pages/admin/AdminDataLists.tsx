import { Head } from "@/shared/components/layout/base/Head";
import { AllProblematicProjects } from "@/features/admin/components/data/AllProblematicProjects";
import { EmailLists } from "@/features/admin/components/data/EmailLists";
import StaffProfileEmails from "@/features/admin/components/data/StaffProfileEmails";
import { StaffUsers } from "@/features/admin/components/data/StaffUsers";
import UnapprovedProjectsThisFY from "@/features/admin/components/data/UnapprovedProjectsThisFY";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useState } from "react";

export const AdminDataLists = () => {
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["unapproved"])); // Start with first tab loaded
  const [activeTab, setActiveTab] = useState("unapproved");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Mark this tab as loaded
    setLoadedTabs((prev) => new Set(prev).add(value));
  };

  return (
    <>
      <Head title="Data" />
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="unapproved">Unapproved Docs</TabsTrigger>
          <TabsTrigger value="problematic">Problematic Projects</TabsTrigger>
          <TabsTrigger value="emails">Email List</TabsTrigger>
          <TabsTrigger value="profiles">Staff Profile List</TabsTrigger>
          <TabsTrigger value="users">Staff Users</TabsTrigger>
        </TabsList>

        {/* Unapproved projects this FY */}
        <TabsContent value="unapproved" className="mt-4">
          {loadedTabs.has("unapproved") && <UnapprovedProjectsThisFY />}
        </TabsContent>

        {/* Problematic Projects */}
        <TabsContent value="problematic" className="mt-4">
          {loadedTabs.has("problematic") && <AllProblematicProjects />}
        </TabsContent>

        {/* Emails */}
        <TabsContent value="emails" className="mt-4">
          {loadedTabs.has("emails") && <EmailLists />}
        </TabsContent>

        {/* Active Staff Profile Emails */}
        <TabsContent value="profiles" className="mt-4">
          {loadedTabs.has("profiles") && <StaffProfileEmails />}
        </TabsContent>

        {/* Staff */}
        <TabsContent value="users" className="mt-4">
          {loadedTabs.has("users") && <StaffUsers />}
        </TabsContent>
      </Tabs>
    </>
  );
};
