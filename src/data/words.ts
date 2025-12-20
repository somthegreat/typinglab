export const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "was", "are", "been", "has", "had", "did", "does", "doing", "being",
  "made", "said", "went", "going", "came", "coming", "got", "getting", "taken", "taking",
  "found", "finding", "thought", "thinking", "told", "telling", "left", "leaving", "called", "calling",
  "asked", "asking", "needed", "needing", "seemed", "seeming", "became", "becoming", "kept", "keeping",
  "put", "putting", "began", "beginning", "let", "letting", "might", "must", "should", "very",
  "still", "own", "through", "much", "where", "same", "right", "too", "old", "long",
  "great", "little", "such", "part", "small", "place", "world", "home", "hand", "high",
  "point", "school", "every", "while", "next", "last", "never", "between", "under", "always"
];

export const generateRandomWords = (count: number): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
  }
  return words.join(' ');
};

export const generateWordList = (count: number): string[] => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
  }
  return words;
};
