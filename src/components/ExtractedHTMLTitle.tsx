import { Text, TextProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Props extends TextProps {
    htmlContent: string;
    onClick?: () => void;
    extraText?: string;
}

export const ExtractedHTMLTitle: React.FC<Props> = ({ htmlContent, onClick, extraText, ...textProps }) => {

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

    // console.log(extraText)

    return (
        <Text {...textProps}
            onClick={onClick}
        >
            {text} {(extraText && extraText !== undefined) ? extraText : null}
        </Text>
    );
};
