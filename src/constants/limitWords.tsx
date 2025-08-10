/**
 * Ambil teks murni dari HTML dan batasi maksimal N kata.
 * Default: 100 kata.
 */
export const limitWords = (html: string, maxWords: number = 100): string => {
  if (!html) return "";
  const textOnly = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = textOnly.split(/\s+/);
  return words.length <= maxWords
    ? textOnly
    : words.slice(0, maxWords).join(" ") + "…";
};
