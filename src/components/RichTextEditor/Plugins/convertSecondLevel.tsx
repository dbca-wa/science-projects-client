export const convertSecondLevel = (text: string) => {
  // Function to find a matching li based on content
  function findLiByContent(dom, content) {
    const lis = dom.querySelectorAll("li");
    for (const li of lis) {
      if (li.textContent === content) {
        return li.closest("li");
      }
    }
    return null;
  }

  const findLiByContentAndNotIncludingClass = (dom, content, classToAvoid) => {
    // const {colorMode} = useColorMode();
    const lis = dom.querySelectorAll("li");
    for (const li of lis) {
      if (
        li.textContent === content &&
        !li.classList.contains(classToAvoid) &&
        !li.parentNode.classList.contains("editor-ul2")
      ) {
        return li.closest("li");
      }
    }
    return null;
  };

  // Get any p tags that have multiple spans underneath them. Get the innerText of each
  // and concatenate them. Remove the spans and replace with a span that has the concatenated string as the inner text
  // const processText = (text: string) => {
  //   const parser = new DOMParser();
  //   const dom = parser.parseFromString(text, "text/html");
  //   // Get all p tags
  //   const pTags = dom.querySelectorAll("p");
  //   pTags.forEach((pTag) => {
  //     // Check if the p tag has multiple spans
  //     const spans = pTag.querySelectorAll("span");
  //     if (spans.length > 1) {
  //       // Get the innerText of each span and concatenate them
  //       let concatenatedText = "";
  //       spans.forEach((span) => {
  //         concatenatedText += span.innerText;
  //       });
  //       // Remove the spans
  //       pTag.innerHTML = "";
  //       // Create a new span with the concatenated text and append it to the p tag
  //       const newSpan = dom.createElement("span");
  //       newSpan.innerText = concatenatedText;
  //       pTag.appendChild(newSpan);
  //     }
  //   });
  //   // Return the modified HTML
  //   return dom.body.innerHTML;
  // };
  // const startsWithUnicode = (text, unicode) => {
  //   // Get the Unicode value of the first character in the text
  //   const firstCharUnicode = text.charCodeAt(0);
  //   // Compare with the Unicode value of the specified character
  //   return firstCharUnicode === unicode;
  // };
  // const secondProcessText = (text: string) => {
  //   const parser = new DOMParser();
  //   const dom = parser.parseFromString(text, "text/html");
  //   // Convert them all to the same format by replacing weird special characters
  //   // Where they come first in the innerText
  //   const newPtags = dom.querySelectorAll("p");
  //   newPtags.forEach((tag) => {
  //     const content = tag.innerText;
  //     const newPTag = dom.createElement("p");
  //     const newSpan = dom.createElement("span");
  //     newSpan.innerHTML = "";
  //     let spanContent = "";
  //     if (
  //       startsWithUnicode(content, 0x2022) ||
  //       tag.innerText.startsWith("·")
  //     ) {
  //       // · 0x00B7
  //       // • 0x2022
  //       console.log("STARTS WITH 1st level");
  //       spanContent = `·${tag.innerText.substring(1)}`;
  //     } else if (startsWithUnicode(content, 0x006f)) {
  //       // o 0x006F
  //       // o 0x006F
  //       console.log("STARTS WITH 2nd level");
  //       spanContent = `z!${tag.innerText.substring(1)}`;
  //     } else if (
  //       startsWithUnicode(content, 0x25a0) ||
  //       startsWithUnicode(content, 0x201d) ||
  //       tag.innerHTML.startsWith("§") ||
  //       tag.innerHTML.startsWith("")
  //     ) {
  //       // § 0x00A7
  //       //  0x25A0
  //       //   U+201D
  //       console.log("STARTS WITH 3rd level");
  //       spanContent = `§${tag.innerText.substring(1)}`;
  //     } else {
  //       console.log(`Starts with something else: ${tag.innerText[0]}`);
  //     }
  //     if (spanContent !== "") {
  //       newSpan.innerText = spanContent;
  //       newPTag.append(newSpan);
  //       console.log("NEW PTAG: ", newPTag);
  //       tag.replaceWith(newPTag);
  //     }
  //   });
  //   const fixUp = (innerHTML) => {
  //     const p = new DOMParser();
  //     const d = parser.parseFromString(innerHTML, "text/html");
  //     console.log("ICE", d);
  //     // ·\t
  //     // z!\t
  //     // \t
  //     return d.body.innerHTML;
  //   };
  //   return fixUp(dom.body.innerHTML);
  // };
  // •
  // o
  // 
  let secondLevel = text;
  // eslint-disable-next-line
  // with tab 'o ' - irregular whitespace
  // with space 'o '
  const secondFormat =
    /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/;

  // const secondFormat = /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">z! (.*?)<\/span><\/p>/;
  const secondDesiredFormat =
    '<li value=${index} class=`editor-li-${colorMode} editor-nested-list-item`}><span style="white-space: pre-wrap;">${content}</span></li>';

  console.log(text);
  // 1. Check if there are any instances in the refined string that match the second format (p tag with a span that has the special character and a space)
  const secondMatches =
    secondLevel.match(
      /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/g
    ) ||
    //   secondLevel.match(
    //     /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">z! (.*?)<\/span><\/p>/g
    //   ) ||
    //   //   secondLevel.match(
    //   //     /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o<\/span>(<span style="white-space: pre-wrap;">.*?<\/span>.*?)?<\/p>/g
    //   //   ) ||
    [];

  // const regex = /<p\b[^>]*><span\b[^>]*>\s*z!.*?<\/span>.*?<\/p>/g;
  // const secondMatches = secondLevel.match(regex) || [];
  // console.log("SM", secondMatches);
  // console.log(secondLevel);
  // 2. replace items in the first matches array with the new li format
  secondMatches.forEach((match, index) => {
    //   const newParser = new DOMParser();
    //   const newDOM = newParser.parseFromString(match, "text/html");
    //   const item = newDOM.querySelectorAll("p")[0];
    //   const content = item.innerText.substring(2);
    const content = match.match(secondFormat)?.[2] || "";
    console.log("CONTENT", content);
    secondLevel = secondLevel.replace(
      match,
      secondDesiredFormat.replace("${content}", content)
    );
  });

  // 3. Convert to a DOM for parsing
  const parser = new DOMParser();
  const dom = parser.parseFromString(secondLevel, "text/html");

  // 4. Check if there are any sibling li groups which aren't within a ul(e.g. </ul><li>...</li><li>...</li><p>).
  // For each group found, append the groups to an array.
  // For each item in the array, create a ul with the items appended, replacing those lis in the actual dom.
  const lis = dom.querySelectorAll("li");
  const skippedLIs: HTMLLIElement[] = [];

  const groupedLIs: HTMLLIElement[][] = [];
  lis.forEach((li) => {
    if (!skippedLIs.includes(li)) {
      const liGroup: HTMLLIElement[] = [];
      if (li.parentElement?.tagName.toLowerCase() !== "ul") {
        // Check if the li's next sibling element is also an li without a parent ul
        // If it is, append that too and keep checking each consecutive next sibling for if it is an li
        // Add all of them to the liGroup, until the next element in the DOM is not an li.
        // Ensure that all the lis that have been pushed to the liGroup are in skippedLis and aren't checked again.
        let currentLi = li;
        while (
          currentLi &&
          currentLi?.tagName.toLowerCase() === "li" &&
          currentLi.parentElement?.tagName.toLowerCase() !== "ul"
        ) {
          // Add the li to the liGroup
          liGroup.push(currentLi);
          skippedLIs.push(currentLi);
          currentLi = currentLi.nextElementSibling as HTMLLIElement;
        }
        groupedLIs.push(liGroup);
      }
    }
  });

  const lisToInsert = [];

  // After grouping the lis, create ul elements and append the li groups
  groupedLIs.forEach((liGroup) => {
    // Create a ul to hold the lis from the group, and an li to hold the ul
    const liElement = dom.createElement("li");
    liElement.className = `editor-li-${colorMode} editor-nested-list-item`;
    const ulElement = dom.createElement("ul");
    ulElement.className = `editor-ul-${colorMode} editor-ul2`;

    // grab each li from the group and append to the ul
    liGroup.forEach((liItem) => {
      ulElement.appendChild(liItem);
    });

    // clone and append the ul to the li
    const clonedUlElement = ulElement.cloneNode(true) as HTMLUListElement;
    liElement.append(clonedUlElement);
    const clonedLiElement = liElement.cloneNode(true) as HTMLLIElement;
    //   console.log(clonedLiElement);
    lisToInsert.push(clonedLiElement);
  });

  // console.log(lisToInsert);
  // Replacement logic ================================================ (ABOVE IS OKAY)
  // Use the text to create a new dom which will be the one returned/cloned then returned.
  const textTocreateDomFrom = secondLevel;
  const newParser = new DOMParser();
  const newDom = newParser.parseFromString(textTocreateDomFrom, "text/html");

  // Iterate over the grouped lis
  groupedLIs.forEach((liGroup, index) => {
    // For each liGroup first item, find where that li is in the newDom that matches.
    const originalLi = liGroup[0];
    const selector =
      'li.editor-nested-list-item span[style="white-space: pre-wrap;"]';
    const originalLiContent = originalLi.textContent || "";

    let previousElement;
    const matchingLi = findLiByContent(newDom, originalLiContent);
    //   console.log("Match!: ", matchingLi);
    if (matchingLi) {
      previousElement = matchingLi.previousElementSibling;
      if (previousElement) {
        //   console.log("Previous element sibling: ", previousElement);
        if (previousElement.className.includes("editor-ul1")) {
          previousElement.append(lisToInsert[index]);
          // Now remove the items in that li Group from the dom so that the content doesnt repeat outside of the ul it is appended to
          liGroup.forEach((liInGroup) => {
            const liToRemove = liInGroup;
            const liToRemoveContent = liToRemove.textContent || "";
            const classToAvoid = "editor-nested-list-item";

            const matchinLiToRemove = findLiByContentAndNotIncludingClass(
              newDom,
              liToRemoveContent,
              classToAvoid
            );
            if (matchinLiToRemove) {
              // console.log("LI TO REMOVE: ", matchinLiToRemove);
              matchinLiToRemove.remove();
            }
          });
        }
      }
      // console.log the previous element before each match
    }
  });

  secondLevel = newDom.body.innerHTML;
  return secondLevel;
};
