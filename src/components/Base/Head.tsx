// Component for setting the Title on the tab using React Helmet

import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLayoutSwitcher } from '../../lib/hooks/LayoutSwitcherContext';

interface IProps {
    title?: string;
}

export const Head = ({ title }: IProps) => {

    const { layout } = useLayoutSwitcher();

    return (
        <HelmetProvider>
            <Helmet>
                <title>{title ? `${layout === "traditional" ? "SPMS" : "Cycle"} | ${title}` : "Loading..."}</title>
                <link rel="icon" type="image/ico" href="favicon.ico" />
            </Helmet>
        </HelmetProvider>
    )
}