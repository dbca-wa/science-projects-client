import { Text, TextProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Props extends TextProps {
  htmlContent: string;
  onClick?: () => void;
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
  const [text, setText] = useState("");

  useEffect(() => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlContent;

    // Find the first 'p' or 'span' tag and get its text content
    const tag = wrapper.querySelector("p, span");
    if (tag) {
      setText(tag.textContent);
    }
  }, [htmlContent]);

  return (
    <Text {...textProps} onClick={onClick}>
      {textBefore && textBefore !== undefined ? textBefore : null} {text}{" "}
      {extraText && extraText !== undefined ? extraText : null}
    </Text>
  );
};
