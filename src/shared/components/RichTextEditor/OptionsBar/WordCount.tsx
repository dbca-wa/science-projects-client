import { useEffect, useState } from "react";

interface IWordCountProps {
  text: string | null;
  wordLimit: number;
  limitCanBePassed: boolean;
  setCanSave: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WordCount = ({
  text,
  wordLimit,
  limitCanBePassed,
  setCanSave,
}: IWordCountProps) => {
  // const [charLimit, setCharLimit] = useState<number>(wordLimit ? wordLimit * 5 : 0);
  const [limitAlmostExceeded, setLimitAlmostExceeded] =
    useState<boolean>(false);
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false);

  let wordCount = 0;
  let charCount = 0;
  if (text === undefined || text === null) {
    wordCount = 0;
    charCount = 0;
  } else {
    wordCount = getWordCount(text);
    charCount = getCharacterCount(text);
  }

  useEffect(() => {
    if (!wordLimit) {
      return; // No need to proceed if word limit is not set
    }

    // const updatedCharLimit = wordLimit * 5;

    if (wordCount <= wordLimit) {
      const isLimitAlmostExceeded = wordCount >= wordLimit * 0.67; // || (charCount >= (updatedCharLimit * 0.67)) ||             // disabled char limit
      // const isLimitExceeded = charCount > updatedCharLimit;

      // setCharLimit(updatedCharLimit);
      setLimitAlmostExceeded(isLimitAlmostExceeded);
      setLimitExceeded(false); // update to isLimitExceeded if adding char count limiting
    } else {
      setLimitAlmostExceeded(true);
      setLimitExceeded(true);
    }
  }, [wordCount, wordLimit, charCount]);

  useEffect(() => {
    if (limitExceeded === true) {
      if (limitCanBePassed !== true) {
        setCanSave(false);
      }
    } else {
      setCanSave(true);
    }
  }, [limitExceeded, limitCanBePassed]);

  return (
    <div className="flex flex-col">
      <p className="font-semibold text-lg text-muted-foreground select-none">
        {`${wordCount} word${wordCount > 1 || wordCount === 0 ? "s" : ""}`} |{" "}
        {`${charCount} character${charCount > 1 || charCount === 0 ? "s" : ""}`}
      </p>
      {wordLimit ? (
        limitExceeded === true ? (
          <p className="text-xs text-red-500 font-bold">
            {`${
              limitCanBePassed ? "Aim for max of" : "Limit"
            }: ${wordLimit} words `}
          </p>
        ) : limitAlmostExceeded === true ? (
          <p className="text-xs text-muted-foreground font-bold">
            {`${
              limitCanBePassed ? "Aim for max of" : "Limit"
            }: ${wordLimit} words `}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground font-semibold">
            {`${
              limitCanBePassed ? "Aim for max of" : "Limit"
            }: ${wordLimit} words `}
          </p>
        )
      ) : null}
    </div>
  );
};

const getWordCount = (data: string) => {
  // Check if the input is empty or null
  if (!data) return 0;
  // Split the string into an array of words using whitespace as the delimiter
  const wordsArray = data.split(/\s+/);
  // Filter out any empty strings from the array (e.g., caused by multiple consecutive spaces)
  const filteredWordsArray = wordsArray.filter((word) => word.trim() !== "");
  // Return the length of the filtered array, which represents the word count
  return filteredWordsArray.length;
};

const getCharacterCount = (data: string) => {
  // Check if the input is empty or null
  if (!data) return 0;
  // Remove whitespace from the string to get the character count
  const characterCount = data.replace(/\s/g, "").length;
  return characterCount;
};
