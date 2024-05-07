import { useEffect, useState } from "react";

const useDistilledHtml = (rawHTML) => {
  const [distilledHtml, setDistilledHtml] = useState("");

  useEffect(() => {
    // Create a new DOMParser to parse the raw HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, "text/html");

    const content = doc.body.textContent;

    // Update the state with the extracted title
    setDistilledHtml(content);
  }, [rawHTML]);

  return distilledHtml;
};

export default useDistilledHtml;
