import React, { useState } from 'react';

const WordToHtmlConverter = () => {
    const [wordText, setWordText] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const convertToHtml = () => {
        // Split the text into paragraphs
        const paragraphs = wordText.split('\n');

        // Process each paragraph
        let inOrderedList = false;
        const html = paragraphs.map((paragraph) => {
            paragraph = paragraph.trim();

            if (paragraph.startsWith('•')) {
                // If the paragraph starts with a bullet point, treat it as an unordered list item
                return `<li>${paragraph.substring(1)}</li>`;
            } else if (/^\d+\.\s/.test(paragraph)) {
                // If the paragraph starts with a number and dot, treat it as an ordered list item
                if (!inOrderedList) {
                    inOrderedList = true;
                    return '<ol>' + `<li>${paragraph.substring(3)}</li>`;
                } else {
                    return `<li>${paragraph.substring(3)}</li>`;
                }
            } else {
                // Otherwise, treat it as a regular paragraph
                if (inOrderedList) {
                    inOrderedList = false;
                    return '</ol>' + `<p>${paragraph}</p>`;
                }
                return `<p>${paragraph}</p>`;
            }
        });

        if (inOrderedList) {
            // Close the ordered list if the last paragraph was part of it
            html.push('</ol>');
        }

        setHtmlContent(html.join(''));
    };
    // return htmlContent

    return (
        <div>
            <textarea
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="Paste your Word content here..."
            />
            <button onClick={convertToHtml}>Convert to HTML</button>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
};

export default WordToHtmlConverter;
