// Script for swapping between modern and traditional layouts via Reaact Context
// Works by setting and getting the layout value in local storage.
// Pages react to that value with the useLayoutSwitcher(), which utilises 
// LayoutSwitcherContext to provide valeus (layout, switchLayout, loading and setLoading)

import { createContext, useState, useContext, useEffect } from 'react';

type Layout = 'modern' | 'traditional';

interface ILayoutContext {
    layout: Layout;
    switchLayout?: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const LayoutSwitcherContext = createContext<ILayoutContext>({
    layout: 'traditional',
    switchLayout: () => { throw new Error('switchLayout function must be overridden') },
    loading: false,
    setLoading: () => { throw new Error('setLoading function must be overridden') },
});

interface ILayoutSwitcherProviderProps {
    children: React.ReactNode;
}

export const LayoutSwitcherProvider = ({ children }: ILayoutSwitcherProviderProps) => {
    const [loading, setLoading] = useState(false);

    const [layout, setLayout] = useState<Layout>(() => {
        const savedLayout = window.localStorage.getItem('layout');
        // Default traditional if not set
        return savedLayout as Layout || 'traditional';
    });

    useEffect(() => {
        window.localStorage.setItem('layout', layout);
    }, [layout]);


    useEffect(() => {
        if (loading) {
            setTimeout(() => setLoading(false), 200);  // adjust timeout as needed
        }
    }, [loading]);


    const switchLayout = () => {
        setLoading(true);
        // Sets new layout based on previous one (opposite)
        setLayout(prevLayout => prevLayout === 'modern' ? 'traditional' : 'modern');
    };

    return (
        <LayoutSwitcherContext.Provider value={{ layout, switchLayout, loading, setLoading }}>
            {children}
        </LayoutSwitcherContext.Provider>
    );
};

export const useLayoutSwitcher = () => useContext(LayoutSwitcherContext);
