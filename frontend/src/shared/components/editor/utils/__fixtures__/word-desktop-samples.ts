/**
 * Word Desktop HTML fixture samples.
 *
 * Representative HTML patterns from Microsoft Word Desktop clipboard output.
 * Used for unit testing the Word HTML → semantic HTML conversion pipeline.
 */

// ─── Inline Formatting ──────────────────────────────────────────────────────

export const DESKTOP_BOLD = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><b><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">Bold text</span></b></p>`;

export const DESKTOP_ITALIC = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><i><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">Italic text</span></i></p>`;

export const DESKTOP_UNDERLINE = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><u><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">Underline text</span></u></p>`;

export const DESKTOP_STRIKETHROUGH = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;text-decoration:line-through">Strikethrough text</span></p>`;

export const DESKTOP_SUPERSCRIPT = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;vertical-align:super">Superscript text</span></p>`;

export const DESKTOP_SUBSCRIPT = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;vertical-align:sub">Subscript text</span></p>`;

// ─── Combination Formatting ─────────────────────────────────────────────────

export const DESKTOP_BOLD_ITALIC = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><b><i><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">Bold italic text</span></i></b></p>`;

export const DESKTOP_BOLD_ITALIC_UNDERLINE = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><b><i><u><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">Bold italic underline text</span></u></i></b></p>`;

export const DESKTOP_BOLD_STRIKETHROUGH = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><b><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;text-decoration:line-through">Bold strikethrough text</span></b></p>`;

// ─── Headings ───────────────────────────────────────────────────────────────

export const DESKTOP_HEADING_1 = `<p class="MsoHeading1" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:16.0pt;font-family:&quot;Calibri Light&quot;,sans-serif;color:#2F5496">Heading 1 Text</span></p>`;

export const DESKTOP_HEADING_2 = `<p class="MsoHeading2" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:13.0pt;font-family:&quot;Calibri Light&quot;,sans-serif;color:#2F5496">Heading 2 Text</span></p>`;

export const DESKTOP_HEADING_3 = `<p class="MsoHeading3" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto"><span style="font-size:12.0pt;font-family:&quot;Calibri Light&quot;,sans-serif;color:#1F3763">Heading 3 Text</span></p>`;

// ─── Unordered Lists ────────────────────────────────────────────────────────

export const DESKTOP_UNORDERED_LIST_NESTED = `<p class="MsoListParagraphCxSpFirst" style="margin-left:36.0pt;mso-list:l0 level1 lfo1"><span style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">·<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>Level 1 item</p><p class="MsoListParagraphCxSpLast" style="margin-left:72.0pt;mso-list:l0 level2 lfo1"><span style="font-family:&quot;Courier New&quot;;mso-fareast-font-family:&quot;Courier New&quot;">o<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>Level 2 item</p>`;

// ─── Ordered Lists ──────────────────────────────────────────────────────────

export const DESKTOP_ORDERED_LIST_NESTED = `<p class="MsoListParagraphCxSpFirst" style="margin-left:36.0pt;mso-list:l1 level1 lfo2">1.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>First item</p><p class="MsoListParagraphCxSpMiddle" style="margin-left:36.0pt;mso-list:l1 level1 lfo2">2.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Second item</p><p class="MsoListParagraphCxSpMiddle" style="margin-left:72.0pt;mso-list:l1 level2 lfo2">a.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Sub item a</p><p class="MsoListParagraphCxSpLast" style="margin-left:108.0pt;mso-list:l1 level3 lfo2">i.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Sub sub item i</p>`;

// ─── Junk-Heavy Sample ──────────────────────────────────────────────────────

export const DESKTOP_JUNK_HEAVY = `<p class="MsoNormal" style="mso-margin-top-alt:auto;mso-margin-bottom-alt:auto;mso-pagination:widow-orphan;mso-line-height-rule:exactly"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;mso-ansi-language:EN-AU;mso-fareast-language:EN-AU;mso-bidi-language:AR-SA;color:black">Clean content here</span></p>`;
