const colors = [
  "#F44336", "#E91E63", "#9C27B0", "#3F51B5",
  "#2196F3", "#03A9F4", "#009688", "#4CAF50",
  "#8BC34A", "#FFC107", "#FF9800", "#FF5722"
];

export const getColor = (name: string) => {
  const char = name[0].toUpperCase();
  const index = (char.charCodeAt(0) - 65) % colors.length;
  return colors[index];
}