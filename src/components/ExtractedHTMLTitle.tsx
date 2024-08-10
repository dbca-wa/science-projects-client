import { Box, TextProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface Props extends TextProps {
  htmlContent: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  textBefore?: string;
  extraText?: string;
}

export const ExtractedHTMLTitle: React.FC<Props> = ({
  htmlContent,
  onClick,
  textBefore,
  extraText,
  ...textProps
}) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlContent;

    // Find the first 'p' or 'span' tag and get its innerHTML
    const tag = wrapper.querySelector("p, span");
    if (tag) {
      // Sanitize the HTML content using DOMPurify
      const sanitizedHTML = DOMPurify.sanitize(tag.innerHTML);
      setContent(sanitizedHTML);
    }
  }, [htmlContent]);

  return (
    <Box {...textProps} onClick={onClick}>
      {textBefore && textBefore !== undefined ? textBefore : null}
      <span dangerouslySetInnerHTML={{ __html: content }} />
      {extraText && extraText !== undefined ? extraText : null}
    </Box>
  );
};
