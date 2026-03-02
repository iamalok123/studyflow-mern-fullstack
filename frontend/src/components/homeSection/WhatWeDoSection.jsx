import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const WhatWeDoSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const techLogos = [
        { name: 'MongoDB', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', letter: 'M' },
        { name: 'React', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', letter: 'R' },
        { name: 'Gemini AI', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', letter: 'G' },
        { name: 'Express', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', letter: 'E' },
        { name: 'Node.js', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', letter: 'N' },
        { name: 'Cloudinary', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', letter: 'C' },
    ];

    const highlights = [
        'Context-aware AI chat with memory',
        'Spaced repetition flashcards',
        'Adaptive quiz difficulty',
        'Secure Cloudinary PDF storage',
    ];

    return (
        <>
            {/* Trust / Tech Stack Row */}
            <section className="py-14 px-4 md:px-16 lg:px-24 w-full bg-white border-t border-slate-200">
                <div className="max-w-[1200px] mx-auto flex flex-col items-center animate-fade-in-up">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 text-center">
                        Built with industry-leading technology
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 max-w-3xl w-full mx-auto">
                        {techLogos.map((tech, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${tech.bg} border-2 ${tech.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                            >
                                <div className={`size-6 rounded-lg bg-white border ${tech.border} flex items-center justify-center text-[11px] font-black ${tech.color}`}>
                                    {tech.letter}
                                </div>
                                <span className={`text-xs font-bold ${tech.color}`}>{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 w-full bg-[#F3F6F9]">
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-14 lg:gap-16">

                    {/* Left: Text */}
                    <div className="flex flex-col items-start w-full lg:w-1/2 animate-fade-in-up">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-[0.2em] mb-3 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                            How It Works
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight" style={{ fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.02em' }}>
                            Your Complete AI{" "}
                            <span className="gradient-text">Study Companion</span>
                        </h2>
                        <p className="text-base leading-relaxed text-slate-600 mb-7 max-w-lg">
                            StudyFlow combines document management, AI intelligence, and interactive learning tools to help you understand faster, retain longer, and study smarter.
                        </p>

                        {/* Feature bullets */}
                        <ul className="space-y-3 mb-8">
                            {highlights.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <div className="size-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                                        <CheckIcon className="size-3 text-emerald-600" strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

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