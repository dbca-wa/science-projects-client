import { useEffect, useState } from 'react';

const useServerImageUrl = (originalLink) => {
    const [apiEndpoint, setApiEndpoint] = useState<string>('');

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            setApiEndpoint('https://scienceprojects-test.dbca.wa.gov.au');
        } else {
            setApiEndpoint('http://127.0.0.1:8000');
        }
    }, []);

    const getModifiedLink = () => {
        if (!originalLink) {
            return '';
        }

        if (originalLink.startsWith('http://') || originalLink.startsWith('https://')) {
            const url = new URL(originalLink);
            return `${apiEndpoint}${url.pathname}`;
        } else if (originalLink.startsWith('/')) {
            return `${apiEndpoint}${originalLink}`;
        } else {
            return `${apiEndpoint}/${originalLink}`;
        }
    };

    return getModifiedLink();
};

export default useServerImageUrl;

