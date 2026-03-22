export const CLASS_LEVELS = [
  "Kids",
  "Children A B1",
  "Children A B2",
  "Children B B1",
  "Children B B2",
  "Youth B1",
  "Youth B2",
  "General B1",
  "General B2",
  "Prepartory",
  "Extraordinary C1-C2",
] as const;

export const CLASS_LEVEL_OPTIONS = CLASS_LEVELS.map((level) => ({
  label: level,
  value: level,
}));
