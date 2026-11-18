// Edit member names, romanized display names, and image labels here.
window.CHART_MEMBERS = [
  { id: "jay", name: "Jay", display: "JAY" },
  { id: "jake", name: "Jake", display: "JAKE" },
  { id: "sunghoon", name: "Sunghoon", display: "SUNGHOON" },
  { id: "sunoo", name: "Sunoo", display: "SUNOO" },
  { id: "jungwon", name: "Jungwon", display: "JUNGWON" },
  { id: "niki", name: "Ni-ki", display: "NI-KI" },
  { id: "evan", name: "Evan", display: "EVAN" }
];

// Pairing labels are deliberately left unfilled rather than guessed.
// Key format is "rowId|columnId": Jake in the row + Jay in the column
// is a different direction from Jay in the row + Jake in the column.
// Fill hangul and romanization after confirming the community's exact terms.
window.PAIRING_LABELS = {
  "jake|jay": { hangul: "젴젱", romanization: "Jekjeng" }
};
