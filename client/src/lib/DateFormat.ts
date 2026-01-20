export const dateFormat = (time: string) => {
  const date = new Date(time);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
