import Footer from "../../components/homeComponents/Footer";
import LenisScroller from "../../components/homeComponents/LenisScroller";
import NavBar from "../../components/homeComponents/NavBar";
import AiCapabilitiesSection from "../../components/homeSection/AiCapabilitiesSection";
import HeroSection from "../../components/homeSection/HeroSection";
import CtaSection from "../../components/homeSection/CtaSection";
import FeaturesGrid from "../../components/homeSection/FeaturesGrid";
import OurTestimonialsSection from "../../components/homeSection/OurTestimonialsSection";
import WhatWeDoSection from "../../components/homeSection/WhatWeDoSection";

export default function Home() {
    return (
        <>
            <LenisScroller />
            <NavBar />
            <main className="w-full overflow-x-hidden bg-[#F7FAF9]">
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
