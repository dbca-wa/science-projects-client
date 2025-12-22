// WIP settings page. Will add functionality as/if needed.

import type { IUserData } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";

interface Props {
  user: IUserData;
  loading: boolean;
}

export const SettingsPage = ({ user }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <div>Settings</div>
      {/* PASSWORD (RENDERED ONLY IF NOT STAFF) */}
      {user?.is_staff && (
        <div
          className={`border rounded-xl p-4 flex flex-col mb-4 ${
            colorMode === "light" ? "border-gray-300" : "border-gray-500"
          }`}
        >
          <div className="flex">
            <div className="w-full flex">
              <div className="flex-1 flex items-center justify-start">
                <p className="font-bold text-lg">
                  Password
                </p>
              </div>

              <div className="flex-1 flex items-center justify-end">
                <Button>Set New Password</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
