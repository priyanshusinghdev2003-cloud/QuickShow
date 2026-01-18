function BlurCircle({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
}: {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}) {
  return (
    <div
      className="absolute -z-50 w-56 h-56 rounded-full bg-primary/30 blur-3xl"
      style={{
        top,
        left,
        right,
        bottom,
      }}
    />
  );
}

export default BlurCircle;
