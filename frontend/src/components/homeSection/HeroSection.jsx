import { CheckIcon, FileTextIcon, BrainCircuitIcon, PenLineIcon, MessageCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HeroSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    return (
        <section className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-8 px-4 md:px-16 lg:px-24 pt-32 pb-16 max-w-[1200px] mx-auto">

            {/* Background blobs */}
            <div className="absolute top-0 left-[-5%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 right-[-5%] w-[300px] h-[300px] bg-teal-100/20 rounded-full blur-[80px] -z-10"></div>

            {/* LEFT: Text */}
            <div className="flex flex-col items-start w-full lg:w-[52%] z-10">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 mb-5 animate-fade-in-up">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs font-semibold text-emerald-700 tracking-wide">AI-Powered Learning</p>
                </div>

                <h1 className="text-[2.5rem] md:text-[3.25rem] lg:text-[3.5rem] font-serif-display font-bold text-slate-900 leading-[1.1] mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Transform Your PDFs{" "}
                    <br className="hidden md:block" />
                    Into <span className="gradient-text">Smart AI Learning</span>
                </h1>

                <p className="text-base leading-relaxed text-slate-500 mb-6 max-w-md animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    Upload documents and instantly generate flashcards, quizzes, summaries, and AI explanations — powered by Google Gemini.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="px-7 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm text-center shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]"
                    >
                        Get Started Free
                    </button>
                    <a href="#features" className="px-7 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 text-center">
                        Explore Features
                    </a>
                </div>
                <p className="text-xs text-slate-400 mb-7 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>No credit card required</p>

                {/* Feature Chips — horizontal row */}
                <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {[
                        { icon: FileTextIcon, text: 'Upload PDFs', active: true },
                        { icon: BrainCircuitIcon, text: 'AI Flashcards', active: true },
                        { icon: PenLineIcon, text: 'Smart Quizzes', active: true },
                        { icon: MessageCircleIcon, text: 'AI Chat', active: true },
                    ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${item.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-white text-slate-500 border border-slate-150 hover:border-emerald-200 hover:text-emerald-600'}`}>
                            <item.icon className="size-3.5" />
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Centered Floating Illustration */}
            <div className="relative w-full lg:w-[48%] flex justify-center items-center mt-4 lg:mt-0 min-h-[400px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                {/* Glow behind */}
                <div className="absolute w-[80%] h-[80%] bg-linear-to-br from-emerald-100/40 to-teal-100/30 rounded-full blur-[50px] -z-10"></div>

                {/* Center container - properly centered */}
                <div className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-3xl border border-emerald-100/50 bg-white/40 backdrop-blur-xl glow-shadow-lg flex items-center justify-center animate-float">

                    {/* PDF Card — top-left */}
                    <div className="absolute -top-3 -left-3 p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 -rotate-6 animate-float" style={{ animationDelay: '0.5s' }}>
                        <div className="w-14 h-18 bg-red-50 rounded-lg border border-red-200 flex flex-col items-center justify-center gap-1 p-2">
                            <div className="w-8 h-0.5 bg-red-400 rounded"></div>
                            <div className="w-6 h-0.5 bg-red-300 rounded"></div>
                            <div className="w-7 h-0.5 bg-red-300 rounded"></div>
                            <span className="text-[8px] text-red-500 font-bold">PDF</span>
                        </div>
                    </div>

                    {/* Flashcard — bottom-right */}
                    <div className="absolute -bottom-3 -right-3 p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 rotate-6 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="w-28 h-18 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col justify-between p-2.5">
                            <div className="w-full h-1 bg-emerald-200 rounded"></div>
                            <div className="w-3/4 h-1 bg-emerald-100 rounded"></div>
                            <div className="flex justify-between">
                                <div className="w-9 h-4 bg-emerald-500 rounded text-[6px] text-white flex items-center justify-center font-bold">Flip</div>
                                <div className="w-9 h-4 bg-slate-100 rounded border border-slate-200"></div>
                            </div>
                        </div>
                    </div>

                    {/* Brain Icon — top-right */}
                    <div className="absolute -top-4 -right-4 p-2.5 bg-white rounded-2xl shadow-lg shadow-slate-200/50 rotate-12 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                        <div className="size-14 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-md shadow-emerald-500/20">🧠</div>
                    </div>

                    {/* Quiz Checkbox — bottom-left */}
                    <div className="absolute -bottom-4 -left-4 p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 -rotate-3 animate-float-slow" style={{ animationDelay: '2s' }}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded bg-emerald-100 flex items-center justify-center"><CheckIcon className="size-3 text-emerald-600" /></div>
                                <div className="w-14 h-1.5 bg-slate-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded border border-slate-200 bg-white"></div>
                                <div className="w-10 h-1.5 bg-slate-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-5 rounded border border-slate-200 bg-white"></div>
                                <div className="w-12 h-1.5 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Chat bubble — mid-left */}
                    <div className="absolute top-[40%] -left-6 p-2 bg-white rounded-xl shadow-lg shadow-slate-200/50 animate-float" style={{ animationDelay: '0.8s' }}>
                        <div className="bg-teal-50 rounded-lg px-3 py-2 border border-teal-100">
                            <p className="text-[8px] text-teal-700 font-medium">What is AI?</p>
                            <p className="text-[7px] text-teal-500 mt-0.5">AI stands for...</p>
                        </div>
                    </div>

                    {/* Center badge */}
                    <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-sm border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-700">StudyFlow</p>
                        <p className="text-[10px] text-slate-400">AI Learning Engine</p>
                    </div>
                </div>

                {/* Stat Badges — right edge */}
                <div className="absolute right-0 lg:-right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                    {[
                        { emoji: '⭐', label: '4.9 Rating', bg: 'bg-yellow-50' },
                        { emoji: '📄', label: '10K+ Docs', bg: 'bg-blue-50' },
                        { emoji: '🧠', label: '50K+ Cards', bg: 'bg-emerald-50' },
                    ].map((stat, i) => (
                        <div key={i} className="px-3 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-slate-600 whitespace-nowrap card-lift">
                            <span className={`size-5 rounded-full ${stat.bg} flex items-center justify-center text-[10px]`}>{stat.emoji}</span>
                            {stat.label}
                        </div>
                    ))}
                </div>

                <p className="absolute -bottom-6 text-center text-[10px] font-medium text-slate-400 w-full">
                    Powered by Google Gemini AI • Secure Cloud Storage
                </p>
            </div>
        </section>
    );
}

export default HeroSection;