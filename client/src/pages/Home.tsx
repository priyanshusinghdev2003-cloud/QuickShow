import Featuredsection from "@/components/Featuredsection";
import Hero from "@/components/Hero";
import TrailerSection from "@/components/TrailerSection";
import gsap from "gsap";
import { useEffect, useRef } from "react";
const Home = () => {
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (homeRef.current) {
      gsap.fromTo(
        homeRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
      );
    }
  }, []);
  return (
    <div ref={homeRef}>
      <Hero />
      <Featuredsection />
      <TrailerSection />
    </div>
  );
};

export default Home;
