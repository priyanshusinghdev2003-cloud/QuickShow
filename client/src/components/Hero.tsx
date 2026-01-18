import { assets } from "@/assets/assets";
import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div
      className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
      }}
    >
      <img
        src={assets.marvelLogo}
        alt="Hero"
        className="max-h-11 lg:h-11 mt-20"
      />
      <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
        Guardians <br />
        of the Galaxy
      </h1>
      <div className="flex items-center gap-4 text-gray-300">
        <span>Action | Adventure | Sci-fi</span>
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4.5 h-4.5" />
          2018
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4.5 h-4.5" />
          2h 16m
        </div>
      </div>
      <p className="max-w-md text-gray-300">
        After being abducted from Earth as a child, Peter Quill, aka Star-Lord,
        is orphaned and raised by a group of intergalactic thieves.
      </p>
      <button
        onClick={() => navigate("/movies")}
        className="flex items-center gap-1 px-6 py-3 bg-primary cursor-pointer rounded-full font-medium hover:bg-primary-dull transition"
      >
        Explore Movies <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Hero;
