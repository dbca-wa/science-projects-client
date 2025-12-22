import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface Props {
  htmlContent: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  textBefore?: string;
  extraText?: string;
  className?: string;
  style?: React.CSSProperties;

  // Legacy props for backward compatibility
  color?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  noOfLines?: number;
  [key: string]: any; // Allow other props to pass through
}

export const ExtractedHTMLTitle: React.FC<Props> = ({
  htmlContent,
  onClick,
  textBefore,
  extraText,
  className,
  style,
  color,
  fontWeight,
  fontSize,
  noOfLines,
  ...otherProps
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

  // Convert legacy props to CSS styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(color && { color }),
    ...(fontWeight && { fontWeight }),
    ...(fontSize && { fontSize }),
    ...(noOfLines && {
      display: "-webkit-box",
      WebkitLineClamp: noOfLines,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
  };

  // Filter out props that shouldn't be passed to DOM elements
  const {
    userSelect,
    cursor,
    transition,
    transform,
    boxShadow,
    borderRadius,
    padding,
    margin,
    width,
    height,
    display,
    position,
    zIndex,
    backgroundColor,
    border,
    borderColor,
    opacity,
    visibility,
    pointerEvents,
    // Add any other legacy props that might cause issues
    ...validDomProps
  } = otherProps;

  return (
    <span
      onClick={onClick}
      className={className}
      style={combinedStyle}
      {...validDomProps}
    >
      {textBefore && textBefore !== undefined ? textBefore : null}
      <span dangerouslySetInnerHTML={{ __html: content }} />
      {extraText && extraText !== undefined ? extraText : null}
    </span>
  );
};
