export function extractThinking(
  raw: string,
): { clean: string; thinking: string | undefined } {
  const startTag = '<mm:think>';
  const endTag = '</mm:think>';

  const startIdx = raw.indexOf(startTag);
  if (startIdx === -1) {
    return { clean: raw, thinking: undefined };
  }

  const contentStart = startIdx + startTag.length;
  const endIdx = raw.indexOf(endTag, contentStart);

  if (endIdx === -1) {
    return {
      clean: raw.slice(0, startIdx),
      thinking: raw.slice(contentStart),
    };
  }

  const thinking = raw.slice(contentStart, endIdx);
  const clean =
    raw.slice(0, startIdx) +
    raw.slice(endIdx + endTag.length).replace(/^\n+/, '');

  return { clean, thinking };
}
