// Component for setting the Title on the tab using React Helmet

import { Helmet, HelmetProvider } from "react-helmet-async";

interface IProps {
  title?: string;
  isStandalone?: boolean;
}

export const Head = ({ title, isStandalone }: IProps) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>
          {title
            ? isStandalone
              ? `${title}`
              : `SPMS | ${title}`
            : "Loading..."}
        </title>

        <link rel="icon" type="image/jpg" href="/dbca.jpg" />
      </Helmet>
    </HelmetProvider>
  );
};
