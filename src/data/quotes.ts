export const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "If life were predictable it would cease to be life, and be without flavor.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    author: "Mother Teresa"
  },
  {
    text: "When you reach the end of your rope, tie a knot in it and hang on.",
    author: "Franklin D. Roosevelt"
  },
  {
    text: "Always remember that you are absolutely unique. Just like everyone else.",
    author: "Margaret Mead"
  },
  {
    text: "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.",
    author: "Helen Keller"
  },
  {
    text: "It is better to be hated for what you are than to be loved for what you are not.",
    author: "André Gide"
  },
  {
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "You miss one hundred percent of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

export const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getRandomQuotes = (count: number) => {
  const shuffled = [...quotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
