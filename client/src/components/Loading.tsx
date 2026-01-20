import BlurCircle from "./BlurCircle";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <BlurCircle top="0" left="0" />
      <BlurCircle top="100px" right="100px" />
      <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-primary"></div>
    </div>
  );
};

export default Loading;
