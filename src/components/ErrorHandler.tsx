// Route for handling errors - used in Router to determine/display what error is produced on page.

import { ErrorRouteComponent,  createFileRoute, useRouter, useRouterState } from "@tanstack/react-router";
import { ProtectedPage } from "../components/Wrappers/ProtectedPage";
import { OtherError } from "./OtherError";
import { NotFound } from "./NotFound";

interface IErrorHandlerProps {
  error: ErrorRouteComponent;
}

export const ErrorHandler = ({error}) => {
  const router = useRouter()
  router.
  const error = useRouteError() as {
    status?: number;
    message?: string;
    stack: string;
  };

  if (error === 404) {
    return (
      <ProtectedPage>
        <NotFound />
      </ProtectedPage>
    );
  } else {
    return (
      <ProtectedPage>
        <OtherError
          code={statusCode || 500}
          message={error?.message || "Unknown error"}
          stack={error?.stack}
        />
      </ProtectedPage>
    );
  }
};


// export const Route = createFileRoute('/paths')({
//   errorComponent: ({error, reset}) => {
//     return <div>ERRORL {error.message}</div>
//   }
// })