import dbcaBCSLogo from "@/images/BCSTransparent.png";

interface ICoverPage {
  year: number;
}

export const CoverPageSection = ({ year }: ICoverPage) => {
  const determineFinancialYear = (year: number) => {
    const fyString = `FY ${year}-${year + 1}`;
    return fyString;
  };

  return (
    <div className="flex h-full w-full items-center justify-center pt-48">
      <div className="relative flex h-full flex-col items-center justify-center">
        <p className="text-xl font-bold">
          Department of
        </p>
        <p className="text-3xl font-bold">
          Biodiversity, Conservation and Attractions
        </p>
        <p className="text-xl">Biodiversity and Conservation Science</p>
        <div className="mt-4 flex w-full flex-col items-center justify-center">
          <p className="text-xl font-semibold">
            Annual Report
          </p>
          <p className="text-xl font-bold">
            {determineFinancialYear(year)}
          </p>
        </div>
        {/* Logo section */}
        <div className="mt-96 max-w-full py-16">
          <img src={dbcaBCSLogo} alt="DBCA BCS Logo" />
        </div>
      </div>
    </div>
  );
};
