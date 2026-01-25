import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppContext } from "@/context/AppContext";

gsap.registerPlugin(ScrollTrigger);

function Featuredsection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { shows } = useAppContext();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".movie-card",
        {
          opacity: 0,
          x: -60,
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            once: true,
          },
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: "power4.out",
          force3D: true,
          willChange: "transform, opacity",
        },
      );
    }, containerRef);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden ">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />
        <p className="text-gray-300 text-lg font-medium">Now Showing</p>
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          View All{" "}
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>
      <div
        className="flex flex-wrap max-sm:justify-center gap-8 mt-8"
        ref={containerRef}
      >
        {shows.slice(0, 4).map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull cursor-pointer rounded-md transition font-medium"
        >
          Show more
        </button>
      </div>
    </div>
  );
}

export default Featuredsection;
