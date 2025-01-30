// Component for setting the Title on the tab using React Helmet

import { Helmet, HelmetProvider } from "react-helmet-async";

interface IProps {
  title?: string;
  isStandalone?: boolean;
  description?: string;
  keywords?: string;
  url?: string;
}

export const Head = ({
  title,
  isStandalone,
  description,
  keywords,
  url,
}: IProps) => {
  // Keywords
  const defaultKeywords =
    "Science Profiles, Science, Project, Management, System, SPMS, Profiles, DBCA, Department of Biodiversity, Conservation and Attractions";

  // Url
  const defaultPublicUrl = "https://science-profiles.dbca.wa.gov.au/";

  // Image
  const imageString = "/dbca.jpg";
  const imageStringAbsolute = `${defaultPublicUrl}dbca.jpg`;

  // Description
  const defaultDescription =
    "Science Project Management System | DBCA | Western Australia";
  const defaultPublicProfileDescription = "Science Staff, DBCA";

  // Functions
  const getDescription = () => {
    const baseDescription =
      title === "Staff Profile"
        ? defaultPublicProfileDescription
        : defaultDescription;

    return description
      ? `${baseDescription} - ${description}`
      : baseDescription;
  };

  const formatTitle = (rawTitle: string | undefined) => {
    if (!rawTitle) return "Loading...";
    const formattedTitle = isStandalone ? rawTitle : `SPMS | ${rawTitle}`;
    return formattedTitle.substring(0, 60);
  };

  // Final values
  const currentUrl = url || defaultPublicUrl;
  const finalDescription = getDescription();
  const finalTitle = formatTitle(title);
  const finalKeywords = keywords
    ? `${defaultKeywords}, ${keywords}`
    : defaultKeywords;

  return (
    <HelmetProvider>
      <Helmet>
        {/* JSON-LD */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Science Staff Profiles",
            "url": "https://science-profiles.dbca.wa.gov.au/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://science-profiles.dbca.wa.gov.au/staff/{user_id}",
              "query-input": "required name=user_id"
            }
          }`}
        </script>
        <title>{finalTitle}</title>
        <link rel="icon" type="image/jpg" href={imageString} />
        <meta name="description" content={finalDescription} />
        <meta name="keywords" content={finalKeywords} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={finalDescription} />
        <meta property="og:image" content={imageStringAbsolute} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={finalTitle} />
        <meta property="twitter:description" content={finalDescription} />
        <meta property="twitter:image" content={imageStringAbsolute} />
        {/* Additional SEO tags */}
        <link rel="canonical" href={currentUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <html lang="en" /> {/* Important for accessibility and SEO */}
      </Helmet>
    </HelmetProvider>
  );
};
