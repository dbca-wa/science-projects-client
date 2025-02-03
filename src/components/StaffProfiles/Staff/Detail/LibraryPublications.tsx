import React from "react";
import Subsection from "./Subsection";
import LogPublicationsButton from "./LogPublicationsButton";
import { PublicationResponse } from "@/types";

interface ILibraryPublicationsProps {
  publicationData: PublicationResponse;
}

const LibraryPublications = ({
  publicationData,
}: ILibraryPublicationsProps) => {
  // Group publications by year
  const publicationsByYear = publicationData.docs.reduce(
    (acc, pub) => {
      const year = pub.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(pub);
      return acc;
    },
    {} as Record<string, typeof publicationData.docs>,
  );

  // Get unique years and sort them in descending order
  const uniqueYears = Object.keys(publicationsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  //   console.log("Publications by year:", publicationsByYear);
  //   console.log("Unique years sorted:", uniqueYears);

  return (
    <Subsection title="Publications" divider>
      <div className="mt-3">
        {publicationData.docs.length === 0 && (
          <p className="text-balance">No publications found.</p>
        )}
        {uniqueYears.map((year) => (
          <div key={`pubsForYear${year}`} className="text-balance">
            <PublicationYear year={year} />
            {publicationsByYear[year].map((pub, index) => (
              <PublicationText
                key={`pub-${year}-${index}`}
                text={pub.BiblioText}
              />
            ))}
          </div>
        ))}
      </div>
      {/* <DummyPublicationsSection /> */}
    </Subsection>
  );
};

export default LibraryPublications;

const PublicationYear = ({ year }: { year: number }) => {
  return <p className="text-lg font-semibold">{year}</p>;
};

// const PublicationText = ({ text }: { text: string }) => {
//   return <p className="py-2 text-sm">{text}</p>;
// };

const PublicationText = ({ text }: { text: string }) => {
  return (
    <div
      className="mb-4 text-sm leading-relaxed text-gray-700 [&>a]:text-blue-500 [&>a]:no-underline hover:[&>a]:text-blue-700 hover:[&>a]:underline [&>b]:mx-1 [&>i]:italic [&>i]:text-gray-600"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};
