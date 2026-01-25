import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import { useEffect } from "react";

const Loading = () => {
  const { nextUrl } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate("/" + nextUrl);
      }, 8000);
    }
  }, []);
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <BlurCircle top="0" left="0" />
      <BlurCircle top="100px" right="100px" />
      <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-primary"></div>
    </div>
  );
};

export default Loading;
