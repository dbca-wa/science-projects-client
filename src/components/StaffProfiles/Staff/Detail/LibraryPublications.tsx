import React from "react";
import Subsection from "./Subsection";
import {
  PublicationResponse,
  Publication,
  LibraryPublicationResponse,
} from "@/types";

interface ILibraryPublicationsProps {
  libraryData: LibraryPublicationResponse;
}

const LibraryPublications = ({ libraryData }: ILibraryPublicationsProps) => {
  const publicationsByYear = libraryData.docs.reduce(
    (acc, pub) => {
      let year = pub.year;
      const bracketMatch = pub.year?.match(/\[(\d{4})\]/);
      if (bracketMatch && bracketMatch[1]) {
        year = bracketMatch[1];
      }

      if (year && !isNaN(Number(year))) {
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(pub);
      }
      return acc;
    },
    {} as Record<string, typeof libraryData.docs>,
  );

  const uniqueYears = Object.keys(publicationsByYear)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  return (
    <Subsection
      title={`Publications${
        !!(libraryData?.docs?.length > 9)
          ? ` (${libraryData?.docs?.length})`
          : ""
      }`}
      divider
    >
      <div className="mt-3">
        {libraryData.docs.length === 0 && (
          <p className="text-balance">No publications found.</p>
        )}
        {uniqueYears.map((year) => (
          <div key={`pubsForYear${year}`} className="text-balance">
            <PublicationYear year={year} />
            {publicationsByYear[year]?.map((pub, index) => (
              <PublicationText key={`pub-${year}-${index}`} publication={pub} />
            ))}
          </div>
        ))}
      </div>
    </Subsection>
  );
};

const PublicationYear = ({ year }: { year: number }) => {
  return <p className="text-lg font-semibold">{year}</p>;
};

interface IPublicationTextProps {
  publication: Publication;
}
// {
//   "linkContent": "Case study: the FORESTCHECK project: the response of vascular flora to silviculture in jarrah (Eucalyptus marginata) forest",
//   "baseTitle":   "Case study: the FORESTCHECK project: the response of vascular flora to silviculture in jarrah (Eucalyptus marginata"
// }
// {
//   "linkContent": "Case study: the FORESTCHECK project: the response of vascular flora to silviculture in jarrah (Eucalyptus marginata) forest",
//   "baseTitle": "Case study: the FORESTCHECK project: the response of vascular flora to silviculture in jarrah (Eucalyptus marginata<"
// }

const PublicationText = ({ publication }: IPublicationTextProps) => {
  const normalizeText = (text: string) => {
    const normalized = text
      .trim()
      .replace(/\.$/, "") // Remove trailing period
      .replace(/\s*:\s*/g, ": ") // Normalize spaces around colons
      .replace(/<i>(.*?)<\/i>/g, "$1") // Replace <i>text</i> with just text
      .replace(/\s+/g, " ") // Normalize multiple spaces
      .replace(/\s*\/.*$/, ""); // Remove everything after and including the forward slash

    // console.log("Normalized text:", { input: text, output: normalized });
    return normalized;
  };

  const processText = (publication: Publication) => {
    let text = publication.BiblioText;
    // console.log("Initial text:", text);

    // First handle staff-only case
    if (publication.staff_only) {
      const processed = text.replace(/<a\b[^>]*>.*?<\/a>\s*\.?\s*/g, "");
      // console.log("Staff-only processed:", processed);
      return processed;
    }

    // Get the base title and clean it properly
    const baseTitle = normalizeText(publication.title);

    // Find any links in the text
    const linkMatch = text.match(/<a\b[^>]*>(.*?)<\/a>/);
    if (!linkMatch) {
      // console.log("No link found in text");
      return text;
    }

    // Get the full link and its content
    const fullLink = linkMatch[0];
    const modifiedLink = fullLink.replace(/\.<\/a>$/, "</a>");
    const linkContent = normalizeText(linkMatch[1]);

    // console.log("String comparison:", {
    //   baseTitle,
    //   linkContent,
    //   lengthDiff: baseTitle.length - linkContent.length,
    // });

    // Check if the link content matches the base title
    if (linkContent === baseTitle) {
      // console.log("Link content matches base title");

      // Find the original title in the text (before the link)
      const beforeLink = text.split(/<a\b[^>]*>.*?<\/a>/)[0];

      // Look for the complete title (including any HTML tags)
      const titleRegex = new RegExp(
        linkMatch[1]
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/(<\/?i>)/g, "(<\\/?i>)?"),
        "g",
      );

      const titleMatch = beforeLink.match(titleRegex);
      if (titleMatch) {
        // Remove the original link from the end
        text = text.replace(fullLink, "");

        // Replace the first occurrence of the title with the link
        text = text.replace(titleMatch[0], `${modifiedLink}.`);

        // console.log("Text reconstruction:", {
        //   originalTitle: titleMatch[0],
        //   modifiedLink,
        //   result: text,
        // });
      } else {
        // console.log("Title not found in text");
      }
    } else {
      // console.log("No match:", { linkContent, baseTitle });
    }

    // Clean up any double periods and spaces
    text = text
      .replace(/\.\s*\./g, ".")
      .replace(/\s+/g, " ")
      .replace(/\s+\./g, ".")
      .trim();

    // console.log("Final text:", text);
    return text;
  };

  const processedText = processText(publication);

  return (
    <div
      className="mb-4 text-sm leading-relaxed text-gray-700 [&>a]:text-blue-500 [&>a]:no-underline hover:[&>a]:text-blue-700 hover:[&>a]:underline [&>b]:mx-1 [&>i]:italic [&>i]:text-gray-600"
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default LibraryPublications;
