export const READING_STATUSES = ["to-read", "reading", "finished"] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  "to-read": "To Read",
  reading: "Reading",
  finished: "Finished",
};

export const GENRES = [
  "Fiction",
  "Non-fiction",
  "Philosophy",
  "Classics",
  "Russian Literature",
  "Mystery",
  "Science Fiction",
  "Biography",
  "History",
  "Poetry",
  "Fantasy",
] as const;
export type Genre = (typeof GENRES)[number];

export const READING_MOODS = [
  { value: "captivating", label: "Captivating", emoji: "\ud83d\udd25" },
  { value: "thought-provoking", label: "Thought-provoking", emoji: "\ud83e\udd14" },
  { value: "relaxing", label: "Relaxing", emoji: "\ud83d\ude0c" },
  { value: "challenging", label: "Challenging", emoji: "\ud83d\udcaa" },
  { value: "emotional", label: "Emotional", emoji: "\ud83d\ude22" },
  { value: "fun", label: "Fun", emoji: "\ud83d\ude02" },
  { value: "slow", label: "Slow", emoji: "\ud83d\ude34" },
] as const;
export type ReadingMood = (typeof READING_MOODS)[number]["value"];

export const RATINGS = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof RATINGS)[number];
