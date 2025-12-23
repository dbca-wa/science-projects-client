import { type INewCycleEmail } from "@/features/projects/services/projects.service";
import type { IEmailModalProps, IUserMe } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { type AxiosError, type AxiosResponse } from "axios";
import { type FC } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

interface IWrapper {
  children: React.ReactElement;
  templateName: string;
  openModalFunction: () => void;
  props?: INewCycleEmail;
}

// Type for the actual API functions
type ApiEmailFunction = (
  data: any,
) => Promise<AxiosResponse<any, any> | AxiosError>;

// Type for what the modal expects
type ModalEmailFunction = (data: any) => Promise<void>;

interface EmailPreviewWrapperProps {
  emailComponent: React.ReactElement;
  title: string;
  ModalComponent: React.ComponentType<IEmailModalProps>;
  thisUser: IUserMe;
  emailFunction: ApiEmailFunction; // This accepts the API function type
}

export const EmailPreviewWrapper: React.FC<EmailPreviewWrapperProps> = ({
  emailComponent,
  title,
  ModalComponent,
  thisUser,
  emailFunction,
}) => {
  const [htmlString, setHtmlString] = React.useState<string>("");
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  React.useEffect(() => {
    try {
      const rendered = renderToStaticMarkup(emailComponent);
      setHtmlString(rendered);
    } catch (error) {
      console.error("Error rendering email:", error);
    }
  }, [emailComponent]);
  return (
    <>
      <ModalComponent
        isOpen={isOpen}
        onClose={onClose}
        emailFunction={emailFunction}
        thisUser={thisUser}
      />

      <div
        className={`
          flex flex-col items-center justify-center w-full relative overflow-hidden
          border rounded-xl
          ${colorMode === "light" ? "border-gray-300" : "border-gray-500"}
        `}
      >
        <div
          className={`
            w-full py-2 flex justify-center text-center rounded-t-xl border-b
            ${colorMode === "light" 
              ? "bg-gray-50 border-gray-300" 
              : "bg-gray-800 border-gray-500"
            }
          `}
        >
          <p className="font-bold text-blue-500">
            {title}
          </p>
        </div>

        <div
          className="email-preview"
          dangerouslySetInnerHTML={{ __html: htmlString }}
        />

        <div
          className={`
            flex justify-end -mt-10 py-4 px-6 w-full rounded-xl rounded-t-none border
            ${colorMode === "light" 
              ? "bg-gray-200 border-gray-300" 
              : "bg-gray-800 border-gray-500"
            }
          `}
        >
          <Button
            onClick={onOpen}
            className={`
              text-white hover:bg-blue-400
              ${colorMode === "light" ? "bg-blue-500" : "bg-blue-500"}
            `}
          >
            Send Test Email
          </Button>
        </div>
      </div>
    </>
  );
};

const EmailStylingPage = () => {
  return <div>Style your emails here</div>;
};

export default EmailStylingPage;
