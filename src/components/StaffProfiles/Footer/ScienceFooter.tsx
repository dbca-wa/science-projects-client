import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCurrentYear } from "@/lib/hooks/helper/useCurrentYear";

const MobileFooter = ({ currentYear }: { currentYear: number }) => {
  return (
    <div className="relative mt-4 flex justify-center bg-[#2d2f32] px-8 py-4 text-white dark:bg-slate-950">
      {/* bg-[#749d5f] */}
      <div className="flex flex-col text-center">
        <div className="flex justify-between">
          <Button
            variant={"link"}
            onClick={() =>
              window.open("https://www.dbca.wa.gov.au/contact", "_blank")
            }
            className="bg-transparent text-sm text-slate-200"
          >
            Contact us
          </Button>
          <Separator orientation="vertical" className="bg-gray-400" />

          <Button
            variant={"link"}
            onClick={() =>
              window.open("https://www.dbca.wa.gov.au/copyright", "_blank")
            }
            className="bg-transparent text-sm text-slate-200"
          >
            Copyright
          </Button>
          <Separator orientation="vertical" className="bg-gray-400" />

          <Button
            variant={"link"}
            onClick={() =>
              window.open("https://www.dbca.wa.gov.au/privacy", "_blank")
            }
            className="bg-transparent text-sm text-slate-200"
          >
            Privacy
          </Button>
        </div>
        <p className="text-balance pt-2 text-sm text-slate-300">
          © Government of Western Australia {currentYear}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const ScienceFooter = () => {
  const currentYear = useCurrentYear();
  return <MobileFooter currentYear={currentYear} />;
  // return isDesktop ? (
  //   <DesktopFooter currentYear={currentYear} />
  // ) : (
  //   <MobileFooter currentYear={currentYear} />
  // );
};
export default ScienceFooter;
