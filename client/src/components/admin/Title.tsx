function Title({ text1, text2 }: { text1: string; text2: string }) {
  return (
    <h1 className="font-medium text-2xl">
      {text1} <span className="text-primary underline">{text2}</span>
    </h1>
  );
}

export default Title;
