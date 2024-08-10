import SimpleSkeletonSection from "../../SimpleSkeletonSection";

const PublicationsSection = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <>
      {isLoading ? (
        <>
          <SimpleSkeletonSection publication />
        </>
      ) : (
        <div className="text-balance">
          <p className="text-lg font-semibold">2022</p>
          <p className="py-2 text-sm">
            Pinder A, Quinlan K, Shiel R, Lewis L (2020). Aquatic invertebrates.
            In Biodiversity survey, mapping, delineation and assessment of
            selected organic mound springs of the Kimberley Region Department of
            Biodiversity, Conservation and Attractions, Kensington, WA. pp.
            20–47, 134–136
          </p>
          <p className="py-2 text-sm">
            Pinder A, Harman A, Bird C, Quinlan K, Angel F, Cowan M et al.
            [Lewis L] (2019). Spread of the non-native redclaw crayfish Cherax
            quadricarinatus (von Martens, 1868) into natural waters of the
            Pilbara region of Western Australia, with observations on potential
            adverse ecological effects. BioInvasions Records 8, pp. 882–897
          </p>
          <p className="py-2 text-sm">
            Pinder A, Quinlan K, Shiel R, Lewis L (2019). A survey of aquatic
            invertebrates of Nimalarragan wetland north of Broome. Department of
            Biodiversity, Conservation and Attractions, Kensington, WA. 27 p.
          </p>

          <p className="text-lg font-semibold">2021</p>

          <p className="py-2 text-sm">
            Pinder A, Quinlan K, Shiel R, Lewis L (2020). Aquatic invertebrates.
            In Biodiversity survey, mapping, delineation and assessment of
            selected organic mound springs of the Kimberley Region Department of
            Biodiversity, Conservation and Attractions, Kensington, WA. pp.
            20–47, 134–136
          </p>
          <p className="py-2 text-sm">
            Pinder A, Harman A, Bird C, Quinlan K, Angel F, Cowan M et al.
            [Lewis L] (2019). Spread of the non-native redclaw crayfish Cherax
            quadricarinatus (von Martens, 1868) into natural waters of the
            Pilbara region of Western Australia, with observations on potential
            adverse ecological effects. BioInvasions Records 8, pp. 882–897
          </p>
          <p className="py-2 text-sm">
            Pinder A, Quinlan K, Shiel R, Lewis L (2019). A survey of aquatic
            invertebrates of Nimalarragan wetland north of Broome. Department of
            Biodiversity, Conservation and Attractions, Kensington, WA. 27 p.
          </p>
        </div>
      )}
    </>
  );
};
export default PublicationsSection;
