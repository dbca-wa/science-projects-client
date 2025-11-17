import { type FC, type ReactNode } from "react";
import Subsection from "./Subsection";
import type {
  PublicationResponse,
  Publication,
  LibraryPublicationResponse,
  CustomPublication,
  IUserMe,
} from "@/shared/types/index.d";
import { PublicationDialog } from "../PublicationDialog";
import PublicationDrawer from "../PublicationDrawer";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import clsx from "clsx";

interface ICustomPublicationsProps {
  publicationData: PublicationResponse;
  userId: number;
  viewingUser: IUserMe;
  buttonsVisible: boolean;
  refetch: () => void;
}

const CustomPublications = ({
  publicationData,
  userId,
  viewingUser,
  buttonsVisible,
  refetch,
}: ICustomPublicationsProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const publicationsByYear = publicationData?.customPublications.reduce(
    (acc, pub) => {
      let year = String(pub.year);
      const bracketMatch = year?.match(/\[(\d{4})\]/);
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
    {} as Record<string, typeof publicationData.customPublications>,
  );

  const uniqueYears = Object.keys(publicationsByYear)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  return (
    <Subsection
      title={`Additional Publications${publicationData?.customPublications.length > 0 ? ` (${publicationData?.customPublications.length})` : ""}`}
      divider
      button={
        (viewingUser?.pk === userId || viewingUser?.is_superuser) &&
        buttonsVisible ? (
          isDesktop ? (
            <>
              <PublicationDialog
                kind="add"
                userPk={userId}
                refetch={refetch}
                staffProfilePk={publicationData?.staffProfilePk}
              />
            </>
          ) : (
            <>
              <PublicationDrawer
                kind="add"
                userPk={userId}
                refetch={refetch}
                staffProfilePk={publicationData?.staffProfilePk}
              />
            </>
          )
        ) : undefined
      }
    >
      <div className="mt-3">
        {publicationData?.customPublications.length === 0 && (
          <p className="text-balance">No publications found.</p>
        )}
        {uniqueYears.map((year, index) => (
          <div key={`pubsForYear${year}`} className="text-balance">
            <PublicationYear year={year} />
            {publicationsByYear[year]?.map((pub, index) => (
              <PublicationText
                key={`pub-${year}-${index}`}
                publication={pub}
                isLast={index === publicationsByYear[year].length - 1}
                buttonsVisible={buttonsVisible}
                refetch={refetch}
              />
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
  publication: CustomPublication;
  buttonsVisible: boolean;
  refetch: () => void;
  isLast: boolean;
}

const PublicationText = ({
  publication,
  buttonsVisible,
  refetch,
  isLast,
}: IPublicationTextProps) => {
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

  const processText = (publication: CustomPublication) => {
    let text = publication.title;

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

  const [isHovered, setIsHovered] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className={clsx("relative select-none", isLast ? "py-4" : "pt-4 pb-0")}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {isHovered && buttonsVisible && (
        <div className="absolute top-0 right-0 z-40 flex py-3">
          {isDesktop ? (
            <>
              <PublicationDialog
                itemPk={publication.pk}
                staffProfilePk={publication.public_profile}
                userPk={0}
                refetch={refetch}
                kind={"edit"}
                publicationItem={{
                  pk: publication?.pk,
                  public_profile: publication.public_profile,
                  title: publication.title,
                  year: Number(publication.year),
                }}
              />

              <PublicationDialog
                itemPk={publication.pk}
                staffProfilePk={publication.public_profile}
                userPk={0}
                refetch={refetch}
                kind={"delete"}
                publicationItem={{
                  pk: publication?.pk,
                  public_profile: publication.public_profile,
                  title: publication.title,
                  year: Number(publication.year),
                }}
              />
            </>
          ) : (
            <>
              <PublicationDrawer
                itemPk={publication.pk}
                staffProfilePk={publication.public_profile}
                userPk={0}
                refetch={refetch}
                kind={"edit"}
                publicationItem={{
                  pk: publication?.pk,
                  public_profile: publication.public_profile,
                  title: publication.title,
                  year: Number(publication.year),
                }}
              />
              <PublicationDrawer
                itemPk={publication.pk}
                staffProfilePk={publication.public_profile}
                userPk={0}
                refetch={refetch}
                kind={"delete"}
                publicationItem={{
                  pk: publication?.pk,
                  public_profile: publication.public_profile,
                  title: publication.title,
                  year: Number(publication.year),
                }}
              />
            </>
          )}
        </div>
      )}

      <div
        className="mb-4 text-sm leading-relaxed text-gray-700 [&>a]:text-blue-500 [&>a]:no-underline [&>a]:hover:text-blue-700 [&>a]:hover:underline [&>b]:mx-1 [&>i]:text-gray-600 [&>i]:italic"
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    </div>
  );
};

export default CustomPublications;
