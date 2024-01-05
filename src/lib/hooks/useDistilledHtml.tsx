import { useEffect, useState } from "react";

const useDistilledHtml = (rawHTML) => {
  const [distilledHtml, setDistilledHtml] = useState("");

  useEffect(() => {
    // Create a new DOMParser to parse the raw HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, "text/html");

    const content = doc.body.textContent;

    // Find the <p> and <span> elements
    // const pElement = doc.querySelector('p');
    // const spanElement = pElement.querySelector('span') ? pElement.querySelector('span') : pElement;

    // Extract the text content of the <span> element
    // const title = spanElement ? spanElement.textContent : '';

    // Update the state with the extracted title
    setDistilledHtml(content);
  }, [rawHTML]);

  return distilledHtml;
};

export default useDistilledHtml;
