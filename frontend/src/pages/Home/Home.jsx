import Footer from "../../components/homeComponents/Footer";
import LenisScroller from "../../components/homeComponents/LenisScroller";
import NavBar from "../../components/homeComponents/NavBar";
import AiCapabilitiesSection from "../../components/homeSection/FreqSection";
import HeroSection from "../../components/homeSection/HeroSection";
import CtaSection from "../../components/homeSection/NewsSection";
import FeaturesGrid from "../../components/homeSection/OurLatestCreations";
import OurTestimonialsSection from "../../components/homeSection/OurTestimonialsSection";
import WhatWeDoSection from "../../components/homeSection/WhatWeDoSection";

export default function Home() {
    return (
        <>
            <LenisScroller />
            <NavBar />
            <main className="w-full overflow-x-hidden">
                <HeroSection />
                <WhatWeDoSection />
                <FeaturesGrid />
                <AiCapabilitiesSection />
                <OurTestimonialsSection />
                <CtaSection />
            </main>
            <Footer />
        </>
    );
}