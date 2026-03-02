import { CheckIcon, FileTextIcon, BrainCircuitIcon, PenLineIcon, MessageCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HeroSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <section className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-8 px-4 md:px-16 lg:px-24 pt-32 pb-20 max-w-[1200px] mx-auto">

            {/* Background blobs — richer opacity */}
            <div className="absolute top-0 left-[-5%] w-[500px] h-[500px] bg-emerald-200/50 rounded-full blur-[120px] -z-10 animate-float-slow" />
            <div className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-[100px] -z-10 animate-float-slow" style={{ animationDelay: '1.5s' }} />

            {/* LEFT: Text */}
            <div className="flex flex-col items-start w-full lg:w-[52%] z-10">
                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300 bg-emerald-50 mb-6 animate-fade-in-up shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase">AI-Powered Learning</p>
                </div>

                <h1
                    className="text-[2.6rem] md:text-[3.4rem] lg:text-[3.75rem] font-bold text-slate-900 leading-[1.08] mb-5 animate-fade-in-up"
                    style={{ animationDelay: '0.1s', fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.03em' }}
                >
                    Transform Your PDFs{" "}
                    <br className="hidden md:block" />
                    Into{" "}
                    <span className="gradient-text">Smart Learning</span>
                </h1>

                <p className="text-base leading-relaxed text-slate-600 mb-7 max-w-md animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    Upload documents and instantly generate flashcards, quizzes, summaries, and AI explanations — powered by Google Gemini.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="px-8 py-3.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-center"
                    >
                        Get Started Free →
                    </button>
                    <a
                        href="#features"
                        className="px-7 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-sm border-2 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 text-center"
                    >
                        Explore Features
                    </a>
                </div>
                <p className="text-xs text-slate-500 mb-8 animate-fade-in-up font-medium" style={{ animationDelay: '0.25s' }}>
                    ✓ Free forever &nbsp;·&nbsp; ✓ No credit card required
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {[
                        { icon: FileTextIcon, text: 'Upload PDFs' },
                        { icon: BrainCircuitIcon, text: 'AI Flashcards' },
                        { icon: PenLineIcon, text: 'Smart Quizzes' },
                        { icon: MessageCircleIcon, text: 'AI Chat' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 shadow-sm cursor-default">
                            <item.icon className="size-3.5 text-emerald-500" />
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Floating Illustration */}
            <div className="relative w-full lg:w-[48%] flex justify-center items-center mt-6 lg:mt-0 min-h-[420px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                {/* Glow behind */}
                <div className="absolute w-[85%] h-[85%] bg-linear-to-br from-emerald-200/60 to-teal-200/50 rounded-full blur-[60px] -z-10" />

                {/* Center container */}
                <div className="relative w-[360px] h-[360px] md:w-[400px] md:h-[400px] rounded-3xl border-2 border-emerald-100 bg-white/60 backdrop-blur-xl shadow-2xl shadow-emerald-500/15 flex items-center justify-center animate-float">

                    {/* PDF Card — top-left */}
                    <div className="absolute -top-4 -left-4 p-3 bg-white rounded-2xl shadow-xl shadow-slate-300/50 -rotate-6 border border-slate-100 animate-float" style={{ animationDelay: '0.5s' }}>
                        <div className="w-14 h-18 bg-red-50 rounded-lg border border-red-200 flex flex-col items-center justify-center gap-1.5 p-2">
                            <div className="w-8 h-0.5 bg-red-400 rounded" />
                            <div className="w-6 h-0.5 bg-red-300 rounded" />
                            <div className="w-7 h-0.5 bg-red-300 rounded" />
                            <span className="text-[9px] text-red-600 font-bold mt-0.5">PDF</span>
                        </div>
                    </div>

                    {/* Flashcard — bottom-right */}
                    <div className="absolute -bottom-4 -right-4 p-3 bg-white rounded-2xl shadow-xl shadow-slate-300/50 rotate-6 border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="w-32 bg-emerald-50 rounded-xl border border-emerald-200 p-3 space-y-2">
                            <div className="w-full h-1.5 bg-emerald-300 rounded" />
                            <div className="w-3/4 h-1 bg-emerald-200 rounded" />
                            <div className="flex justify-between pt-1">
                                <div className="px-2 py-1 bg-emerald-500 rounded-lg text-[7px] text-white font-bold">Flip ↩</div>
                                <div className="px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[7px] text-slate-500">Next</div>
                            </div>
                        </div>
                    </div>

                    {/* Brain Icon — top-right */}
                    <div className="absolute -top-5 -right-5 p-3 bg-white rounded-2xl shadow-xl shadow-slate-300/50 rotate-12 border border-slate-100 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                        <div className="size-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">🧠</div>
                    </div>

                    {/* Quiz Checkboxes — bottom-left */}
                    <div className="absolute -bottom-5 -left-5 p-3.5 bg-white rounded-2xl shadow-xl shadow-slate-300/50 -rotate-3 border border-slate-100 animate-float-slow" style={{ animationDelay: '2s' }}>
                        <div className="flex flex-col gap-2">
                            {[
                                { checked: true, width: 'w-16' },
                                { checked: false, width: 'w-11' },
                                { checked: false, width: 'w-14' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`size-5 rounded border ${row.checked ? 'bg-emerald-100 border-emerald-400' : 'bg-white border-slate-300'} flex items-center justify-center`}>
                                        {row.checked && <CheckIcon className="size-3 text-emerald-600" strokeWidth={3} />}
                                    </div>
                                    <div className={`${row.width} h-1.5 bg-slate-200 rounded`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat bubble — mid-left */}
                    <div className="absolute top-[40%] -left-8 p-2.5 bg-white rounded-2xl shadow-xl shadow-slate-300/50 border border-slate-100 animate-float" style={{ animationDelay: '0.8s' }}>
                        <div className="bg-teal-50 rounded-xl px-3.5 py-2.5 border border-teal-200">
                            <p className="text-[9px] text-teal-800 font-semibold">What is AI?</p>
                            <p className="text-[8px] text-teal-600 mt-1">AI stands for...</p>
                        </div>
                    </div>

                    {/* Center badge */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-slate-200 text-center">
                        <p className="text-sm font-bold text-slate-800">StudyFlow</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">AI Learning Engine</p>
                        <div className="flex gap-1 justify-center mt-2">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            <span className="size-1.5 rounded-full bg-teal-400" />
                            <span className="size-1.5 rounded-full bg-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Stat Badges */}
                <div className="absolute right-0 lg:-right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-10">
                    {[
                        { emoji: '⭐', label: '4.9 Rating', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        { emoji: '📄', label: '10K+ Docs', bg: 'bg-blue-50', border: 'border-blue-200' },
                        { emoji: '🧠', label: '50K+ Cards', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    ].map((stat, i) => (
                        <div key={i} className={`px-3.5 py-2 bg-white rounded-full shadow-md border ${stat.border} flex items-center gap-2 text-[11px] font-bold text-slate-700 whitespace-nowrap hover:-translate-y-0.5 transition-transform duration-200`}>
                            <span className={`size-5 rounded-full ${stat.bg} flex items-center justify-center text-[10px]`}>{stat.emoji}</span>
                            {stat.label}
                        </div>
                    ))}
                </div>

                <p className="absolute -bottom-8 text-center text-[10px] font-semibold text-slate-500 w-full tracking-wide">
                    Powered by Google Gemini AI · Secure Cloud Storage
                </p>
            </div>
        </section>
    );
}

export default HeroSection;