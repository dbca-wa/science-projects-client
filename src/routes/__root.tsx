import { Root } from "@/components/Base/Root";
import { ErrorHandler } from "@/components/ErrorHandler";
import { ProtectedPage } from "@/components/Wrappers/ProtectedPage";
import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => Index,
  errorComponent: (e) => <ErrorHandler error={e} />,
});

const Index = () => {
  return (
    <>
      <ProtectedPage>
        <Root />
      </ProtectedPage>
      <TanStackRouterDevtools />
    </>
  );
};
