import stringSimilarity from "string-similarity";

// Helper function to remove content in parentheses and punctuation.
function normalizeTitle(title) {
  // Remove text in parentheses (including the parentheses).
  let normalized = title.replace(/\([^)]*\)/g, "");
  // Remove punctuation (anything that's not a letter, digit, or whitespace).
  normalized = normalized.replace(/[^\w\s]|_/g, "");
  // Replace multiple spaces with a single space and trim.
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized.toLowerCase();
}

export function isSongTitleCorrect(userInput, songTitle) {
  const normalizedInput = normalizeTitle(userInput);
  const normalizedTitle = normalizeTitle(songTitle);
  const similarity = stringSimilarity.compareTwoStrings(
    normalizedInput,
    normalizedTitle
  );
  return similarity >= 0.95;
}
