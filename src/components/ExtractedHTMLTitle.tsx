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
      // Configure DOMPurify to sanitize the HTML content
      const sanitizedHTML = DOMPurify.sanitize(tag.innerHTML, {
        ALLOWED_TAGS: ["i", "em"], // Allow desired tags
        FORBID_ATTR: ["style", "class"], // Forbid the 'style' attribute to prevent color changes
      });
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
