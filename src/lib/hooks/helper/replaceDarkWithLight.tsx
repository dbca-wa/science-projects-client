export const replaceDarkWithLight = (htmlString: string): string => {
  // Replace 'dark' with 'light' in class attributes
  const modifiedHTML = htmlString.replace(
    /class\s*=\s*["']([^"']*dark[^"']*)["']/gi,
    (match, group) => {
      return `class="${group.replace(/\bdark\b/g, "light")}"`;
    },
  );

  // Add margin-right: 4px to all <li> elements
  const finalHTML = modifiedHTML.replace(
    /<li/g,
    '<li style="margin-left: 36px;"',
  );

  return finalHTML;
};

export default replaceDarkWithLight;
