import stringSimilarity from "string-similarity";

export function isSongTitleCorrect(userInput, songTitle) {
  const similarity = stringSimilarity.compareTwoStrings(
    userInput.toLowerCase(),
    songTitle.toLowerCase()
  );
  return similarity >= 0.95;
}
