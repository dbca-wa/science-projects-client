import SimpleSkeletonSection from "../../SimpleSkeletonSection";
import EducationEntry from "./EducationEntry";
import Subsection from "./Subsection";

const OverviewSection = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="">
      {/* Profile/About Me */}
      {isLoading ? (
        <SimpleSkeletonSection />
      ) : (
        <Subsection title="About Me">
          <p className="text-balance">
            I have been engaging in research in Japanese history and culture in
            the 19th century (the late Edo to early Meiji periods) with a
            special interest in centre-periphery interplay in the areas of
          </p>
          <ul className="ml-12 mt-4 list-disc text-balance">
            <li>
              provincial elite commoners - everyday life, arts and networks
            </li>
            <li>print culture and the publishing industry</li>
            <li>education, communication and popular literature</li>
            <li>Western Studies, and</li>
            <li>modernisation.</li>
          </ul>
        </Subsection>
      )}
      {/* Expertise */}
      {isLoading ? (
        <SimpleSkeletonSection />
      ) : (
        <Subsection title="Expertise">
          <ul className="ml-12 mt-2 list-disc text-balance">
            <li>
              Impacts of logging and fire on frogs, reptiles and mammals in
              south-west forests
            </li>
            <li>
              Biology and ecology of the koomal (common brushtail possum,
              Trichosurus vulpecula hypoleucus) and the ngwayir (western
              ringtail possum, Pseudocheirus occidentalis)
            </li>
            <li>Diagnosis of the declines of native mammals</li>
            <li>
              Vertebrate fauna ecology, conservation and in the south-west
              forests
            </li>
          </ul>
        </Subsection>
      )}
      {/* Education */}
      {isLoading ? (
        <SimpleSkeletonSection education />
      ) : (
        <Subsection title="Education">
          <EducationEntry />
          <EducationEntry />
          <EducationEntry />
        </Subsection>
      )}
    </div>
  );
};
// Joining of Contact (email, phone, address), Profile and Expertise

export default OverviewSection;
