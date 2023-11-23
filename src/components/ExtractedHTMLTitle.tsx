import { Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const ExtractedHTMLTitle = ({ htmlContent, ...textProps }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;

        // Find the first 'p' or 'span' tag and get its text content
        const tag = wrapper.querySelector('p, span');
        if (tag) {
            setText(tag.textContent);
        }
    }, [htmlContent]);

    return (
        <Text {...textProps}>
            {text}
        </Text>
    );
};
