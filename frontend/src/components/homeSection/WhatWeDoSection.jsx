import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const WhatWeDoSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const logos = [
        '/assets/companies-logo/instagram.svg',
        '/assets/companies-logo/framer.svg',
        '/assets/companies-logo/microsoft.svg',
        '/assets/companies-logo/huawei.svg',
        '/assets/companies-logo/walmart.svg',
    ]

    return (
        <>
            {/* Trust Logos */}
            <section className="py-14 px-4 md:px-16 lg:px-24 w-full bg-white border-t border-slate-100">
                <div className="max-w-[1200px] mx-auto flex flex-col items-center animate-fade-in-up">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">
                        Trusted by Students, Developers & Lifelong Learners Worldwide
                    </p>
                    <div className="flex flex-wrap justify-between max-sm:justify-center gap-10 max-w-4xl w-full mx-auto py-4" id="logo-container">
                        {logos.map((logo, index) => <img key={index} src={logo} alt="logo" className="h-7 w-auto max-w-xs" />)}
                    </div>
                </div>
            </section>

            {/* Second Section */}
            <section id="how-it-works" className="py-20 md:py-24 px-4 md:px-16 lg:px-24 w-full bg-[#F8FAFB]">
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
                    <div className="flex flex-col items-start w-full lg:w-1/2 animate-fade-in-up">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] mb-3">How It Works</span>
                        <h2 className="text-3xl md:text-4xl font-serif-display font-bold text-slate-900 mb-5 leading-tight">
                            Your Complete AI <span className="gradient-text">Study Companion</span>
                        </h2>
                        <p className="text-base leading-relaxed text-slate-500 mb-7 max-w-lg">
                            StudyFlow combines document management, AI intelligence, and interactive learning tools to help you understand faster, retain longer, and study smarter.
                        </p>
                        <button
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                            className="group flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 py-3 px-7 rounded-xl text-white font-semibold text-sm active:scale-[0.98]">
                            <span>Start Learning</span>
                            <ArrowRightIcon className='size-4 group-hover:translate-x-0.5 transition-transform' />
                        </button>
                    </div>

                    <div className="relative w-full lg:w-1/2 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                        <div className="absolute inset-0 bg-linear-to-tr from-emerald-100/40 to-teal-100/30 rounded-full blur-[60px] -z-10 scale-90"></div>
                        <div className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-visible glow-shadow-lg border-4 border-white">
                            <img src="https://cdni.iconscout.com/illustration/free/thumb/free-man-working-on-laptop-illustration-svg-download-png-4243574.png" alt="Student studying" className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute -top-4 -right-4 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 animate-float" style={{ animationDelay: '0.2s' }}>
                                <div className="size-9 rounded-lg bg-orange-50 flex items-center justify-center text-lg">💡</div>
                            </div>
                            <div className="absolute top-1/3 -left-5 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 animate-float-slow" style={{ animationDelay: '0.7s' }}>
                                <div className="size-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg">🧠</div>
                            </div>
                            <div className="absolute -bottom-4 right-8 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 animate-float" style={{ animationDelay: '1.1s' }}>
                                <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg">💬</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default WhatWeDoSection;