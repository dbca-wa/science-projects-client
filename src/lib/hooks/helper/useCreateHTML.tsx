import React, { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';

interface IProps {
    ReactComponent: React.ComponentType<any>;
    props?: any;
}

const useCreateHTML = ({ ReactComponent, props }: IProps) => {
    const [htmlOutput, setHtmlOutput] = useState<string>('');

    useEffect(() => {
        const generateHTML = () => {
            return ReactDOMServer.renderToString(
                React.createElement(ReactComponent, props)
            );
        };

        setHtmlOutput(generateHTML());
    }, [ReactComponent, props]);

    return { htmlOutput, setHtmlOutput };
};

export default useCreateHTML;
