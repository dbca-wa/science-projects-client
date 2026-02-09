import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";

/**
 * BackgroundImage - Isolated component that reacts to theme changes
 * Prevents parent layout from re-rendering 
 * NOTE: Swapped to pure tailwind class and removed observer
 */
const BackgroundImage = () => {

  return (
    <>
       {/* Light mode background */}
      <img
        src="/80mile.jpg"
        alt=""
        className="fixed top-0 left-0 w-full h-full object-cover -z-10 dark:hidden"
      />
      {/* Dark mode background */}
      <img
        src="/night.webp"
        alt=""
        className="fixed top-0 left-0 w-full h-full object-cover -z-10 hidden dark:block"
      />
      </>
  );
};

BackgroundImage.displayName = "BackgroundImage";

const ContentBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={`my-6 min-h-[1000px] rounded-lg py-4 bg-white dark:bg-gray-900/80`}
    >
      <div className="mx-4 sm:mx-6 md:mx-10 h-full min-h-screen py-4">
        {children}
      </div>
    </div>
  );
};

ContentBox.displayName = "ContentBox";

/**
 * AppLayout component
 * Provides the main layout structure with header, content area, and footer
 */
export function AppLayout() {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden flex flex-col">
      {/* Scrollable container */}
      <div className="top-0 left-0 right-0 overflow-y-auto no-scrollbar">
        {/* Header */}
        <Header />

        {/* Content Wrapper with responsive padding */}
        <div className="mx-4 sm:mx-6 md:mx-[10%] lg:mx-[15%] py-2 flex flex-col min-h-screen">
          <ContentBox>
            <Outlet />
          </ContentBox>

          {/* Background Image - Handles its own theme reactivity */}
          <BackgroundImage />
        </div>

        {/* Footer */}
        <Footer />
      </div>
      
      {/* Portal container for confetti - full screen */}
      <div id="confetti-root" className="fixed inset-0 pointer-events-none z-50" />
    </div>
  );
}

AppLayout.displayName = "AppLayout";
