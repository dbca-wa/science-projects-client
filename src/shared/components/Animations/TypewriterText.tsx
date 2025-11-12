import { motion } from "framer-motion";
import React, { type ReactNode, type ReactElement } from "react";

interface ITypewriterProps {
  children: ReactNode;
  characterDelay?: number; // Time between characters in seconds
  characterDuration?: number; // Duration for each character to fade in
}

export const TypewriterText = ({
  children,
  characterDelay = 0.005,
  characterDuration = 0.005,
}: ITypewriterProps) => {
  const childArray = React.Children.toArray(children);

  let totalCharacters = 0;

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "inline", whiteSpace: "normal" }}
    >
      {childArray.map((child, lineIndex) => {
        if (React.isValidElement(child)) {
          // Type assertion to access props safely
          const element = child as ReactElement<{ children: ReactNode }>;
          const childContent = element.props.children;

          if (typeof childContent === "string") {
            const startDelay = totalCharacters * characterDelay;
            totalCharacters += childContent.length;

            return (
              <AnimatedText
                key={lineIndex}
                text={childContent}
                delayStart={startDelay}
                characterDelay={characterDelay}
                characterDuration={characterDuration}
              />
            );
          } else {
            // Non-string elements: render after the complete text animation
            return (
              <motion.span
                key={lineIndex}
                style={{ display: "inline", marginLeft: "0.2em" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: totalCharacters * characterDelay,
                  duration: characterDuration,
                }}
              >
                {child}
              </motion.span>
            );
          }
        }
        return null;
      })}
    </motion.span>
  );
};

interface AnimatedTextProps {
  text: string;
  delayStart: number;
  characterDelay: number;
  characterDuration: number;
}

const AnimatedText = ({
  text,
  delayStart,
  characterDelay,
  characterDuration,
}: AnimatedTextProps) => {
  return (
    <motion.span style={{ display: "inline" }}>
      {text.split("").map((char, charIndex) => (
        <motion.span
          key={charIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delayStart + charIndex * characterDelay,
            duration: characterDuration,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
