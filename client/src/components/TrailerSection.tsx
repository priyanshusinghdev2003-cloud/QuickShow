import { dummyTrailers } from "@/assets/assets";
import type { Trailer } from "@/types/assets";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState<Trailer>(
    dummyTrailers[0],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, scrollTrigger: containerRef.current },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="px-6 md:px-6 lg:px-24 xl:px-44 py-20 overflow-hidden"
      ref={containerRef}
    >
      <p className="text-gray-300 font-medium text-lg masx-w-[960px] mx-auto">
        Trailers
      </p>
      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        <ReactPlayer
          src={currentTrailer.videoUrl}
          controls={true}
          className="mx-auto max-w-full"
          width="960px"
          height="540px"
        />
      </div>
      <div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer) => (
          <div
            key={trailer.videoUrl}
            className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer"
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={"trailer"}
              className="rounded-lg w-full h-full object-cover brightness-75"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
