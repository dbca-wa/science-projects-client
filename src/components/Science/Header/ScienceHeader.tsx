import { Button } from "@/components/ui/button";

const DesktopHeader = () => {
  const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
    .VITE_PRODUCTION_BACKEND_BASE_URL;

  return (
    <div className="flex h-[65px] w-full flex-row items-center justify-between gap-2 bg-[#2d2f32] p-2 text-white dark:bg-slate-950">
      <div className="flex justify-start px-8">
        <img src={"/logo.svg"} className="w-[240px] p-6" />
      </div>
      <div className="flex justify-end">
        <div className="flex w-[100px] items-center justify-between">
          <Button variant="link" className="bg-transparent text-lg text-white">
            <a href={`${VITE_PRODUCTION_BACKEND_BASE_URL ?? "/"}`}>SPMS</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

const MobileHeader = () => {
  const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
    .VITE_PRODUCTION_BACKEND_BASE_URL;

  return (
    <div className="flex h-[65px] w-full items-center justify-between gap-2 bg-[#2d2f32] p-2 px-5 text-white dark:bg-slate-950">
      <img src={"/logo.svg"} className="w-[190px]" />
      <Button variant="link" className="bg-transparent text-lg text-white">
        <a href={`${VITE_PRODUCTION_BACKEND_BASE_URL ?? "/"}`} className="">
          SPMS
        </a>
      </Button>
    </div>
  );
};

const ScienceHeader = ({ isDesktop }: { isDesktop: boolean }) => {
  return <>{isDesktop ? <DesktopHeader /> : <MobileHeader />}</>;
};
export default ScienceHeader;
