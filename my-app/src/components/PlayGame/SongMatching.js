import stringSimilarity from "string-similarity";

// Helper function to remove content in parentheses, punctuation, and anything after "-"
function normalizeTitle(title) {
  // Remove text after "-" if it exists
  let normalized = title.split("-")[0];
  // Remove text in parentheses (including the parentheses)
  normalized = normalized.replace(/\([^)]*\)/g, "");
  // Remove punctuation (anything that's not a letter, digit, or whitespace)
  normalized = normalized.replace(/[^\w\s]|_/g, "");
  // Replace multiple spaces with a single space and trim
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized.toLowerCase();
}

// Helper function to check if any 2 words match for CLASSICAL genre
function hasTwoWordMatch(userWords, titleWords) {
  let matchCount = 0;
  for (let word of userWords) {
    if (titleWords.includes(word)) {
      matchCount++;
      if (matchCount >= 2) return true; // Sufficient matches
    }
  }
  return false;
}

// Helper function to check if guess is close (all words but one match)
function isCloseGuess(userWords, titleWords) {
  const commonWords = userWords.filter((word) => titleWords.includes(word));
  return (
    commonWords.length >= Math.max(1, titleWords.length - 1) && // All but one word must match
    userWords.length >= titleWords.length - 1 // User input should not be too short
  );
}

export function isSongTitleCorrect(userInput, songTitle, gameGenre) {
  const normalizedInput = normalizeTitle(userInput);
  const normalizedTitle = normalizeTitle(songTitle);

  const inputWords = normalizedInput.split(" ");
  const titleWords = normalizedTitle.split(" ");

  // Check for CLASSICAL genre with 2-word match condition
  if (gameGenre === "CLASSICAL") {
    const isCorrect = hasTwoWordMatch(inputWords, titleWords);
    return { isCorrect, isClose: false };
  }

  // Default check for other genres with similarity threshold
  const similarity = stringSimilarity.compareTwoStrings(
    normalizedInput,
    normalizedTitle
  );

  const isCorrect = similarity >= 0.95;
  const isClose = !isCorrect && isCloseGuess(inputWords, titleWords); // Check if close but not correct

  return { isCorrect, isClose };
}
