// Component for setting the Title on the tab using React Helmet

import { Helmet, HelmetProvider } from "react-helmet-async";

export interface StaffUserData {
  name: string;
  position: string;
  keywords?: string;
  about?: string;
}

interface IProps {
  title?: string;
  isStandalone?: boolean;
  description?: string;
  keywords?: string;
  url?: string;
  userData?: StaffUserData;
  isStaffProfile?: boolean;
}

export const Head = ({
  title,
  isStandalone,
  description,
  keywords,
  url,
  userData,
  isStaffProfile,
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
    "Science Project Management System | DBCA | Department of Biodiversity, Conservation and Attractions | Western Australia";
  const defaultPublicProfileDescription =
    "Science Staff | DBCA | Department of Biodiversity, Conservation and Attractions | Western Australia";

  // Functions
  const getDescription = () => {
    const baseDescription =
      title === "Staff Profile"
        ? defaultPublicProfileDescription
        : defaultDescription;

    return description ? `${description}` : baseDescription;
  };

  const formatTitle = (rawTitle: string | undefined) => {
    if (!rawTitle) return "Loading...";
    const formattedTitle = isStandalone ? rawTitle : `SPMS | ${rawTitle}`;
    return formattedTitle.substring(0, 60);
  };

  const getRobotsContent = (path: string) => {
    if (path.startsWith("/staff")) {
      return "index, follow";
    }
    return "noindex, nofollow";
  };

  const getSitemapStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://science-profiles.dbca.wa.gov.au/staff",
      name: "Staff Directory",
      description: "Browse all science staff profiles",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://science-profiles.dbca.wa.gov.au/#website",
      },
    };
  };

  const getStructuredData = () => {
    if (isStaffProfile && userData) {
      // Profile page structured data
      return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: userData.name,
        jobTitle: userData.position,
        description: userData.about,
        keywords: userData.keywords,
        worksFor: {
          "@type": "Organization",
          name: "Department of Biodiversity, Conservation and Attractions",
          url: "https://www.dbca.wa.gov.au/",
          "@id": "https://www.dbca.wa.gov.au/",
        },
        url: currentUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Science Staff Profiles",
          url: "https://science-profiles.dbca.wa.gov.au/",
          "@id": "https://science-profiles.dbca.wa.gov.au/#website",
        },
      };
    }

    // Main website structured data
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://science-profiles.dbca.wa.gov.au/#website",
      name: "Science Staff Profiles",
      url: "https://science-profiles.dbca.wa.gov.au/",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://science-profiles.dbca.wa.gov.au/staff/{user_id}",
        },
      },
      mainEntityOfPage: getSitemapStructuredData(),
    };
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
          {JSON.stringify(getStructuredData())}
        </script>

        <title>{finalTitle}</title>
        <link rel="icon" type="image/jpg" href={imageString} />
        <link
          rel="alternate"
          type="application/json"
          href="https://science-profiles.dbca.wa.gov.au/staff"
          title="Staff Directory"
        />
        <meta name="description" content={finalDescription} />
        <meta name="keywords" content={finalKeywords} />
        <meta httpEquiv="Cache-Control" content="max-age=3600" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="sitemap"
          content="https://science-profiles.dbca.wa.gov.au/staff"
        />

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
        <meta
          name="robots"
          content={getRobotsContent(window.location.pathname)}
        />
        <meta
          name="googlebot"
          content={getRobotsContent(window.location.pathname)}
        />
        <meta
          name="googlebot-news"
          content={getRobotsContent(window.location.pathname)}
        />
        <meta
          name="slurp"
          content={getRobotsContent(window.location.pathname)}
        />
        <meta
          name="bingbot"
          content={getRobotsContent(window.location.pathname)}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <html lang="en" />
      </Helmet>
    </HelmetProvider>
  );
};
