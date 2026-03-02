import { Link } from 'react-router-dom';
import { SparklesIcon, FileUp, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CtaSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    return (
        <section className='relative py-28 px-4 w-full overflow-hidden bg-white'>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.4] -z-10" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Large subtle glowing orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10"></div>

            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10 relative">

                {/* Left Text */}
                <div className="w-full lg:w-1/2 text-left animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 mb-6 text-emerald-600">
                        <SparklesIcon className="size-5" />
                    </div>

                    <h2 className='text-4xl md:text-5xl lg:text-[3.25rem] font-serif-display font-bold text-slate-900 mb-6 leading-tight'>
                        Ready to Study <span className="gradient-text">Smarter?</span>
                    </h2>

                    <p className='text-lg text-slate-500 mb-8 max-w-md leading-relaxed'>
                        Join thousands of students who are turning overwhelming PDFs into easy-to-digest flashcards and quizzes instantly.
                    </p>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="inline-block bg-linear-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-teal-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                    >
                        Start Learning For Free
                    </button>
                    <p className="mt-4 text-xs text-slate-400">No credit card required • Cancel anytime</p>
                </div>

                {/* Right Decorative UI Elements (Light Mode) */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative w-full max-w-md h-[300px] bg-slate-50/50 border border-slate-200 rounded-4xl backdrop-blur-md p-6 overflow-hidden">

                        {/* Decorative UI elements inside light box */}
                        <div className="absolute top-8 left-8 bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 w-48 shadow-lg shadow-slate-200/50 animate-float">
                            <div className="bg-emerald-50 p-2 rounded-lg"><FileUp className="size-5 text-emerald-500" /></div>
                            <div>
                                <div className="h-2 w-16 bg-slate-200 rounded"></div>
                                <div className="h-1.5 w-10 bg-slate-100 rounded mt-2"></div>
                            </div>
                        </div>

                        <div className="absolute top-24 right-8 bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 w-52 shadow-lg shadow-slate-200/50 animate-float" style={{ animationDelay: '0.5s' }}>
                            <div className="bg-teal-50 p-2 rounded-lg"><Zap className="size-5 text-teal-500" /></div>
                            <div>
                                <div className="h-2 w-20 bg-slate-200 rounded"></div>
                                <div className="h-1.5 w-12 bg-slate-100 rounded mt-2"></div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-16 bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 w-56 shadow-lg shadow-slate-200/50 animate-float" style={{ animationDelay: '1s' }}>
                            <div className="bg-blue-50 p-2 rounded-lg"><BookOpen className="size-5 text-blue-500" /></div>
                            <div>
                                <div className="h-2 w-24 bg-slate-200 rounded"></div>
                                <div className="flex gap-1 mt-2">
                                    <div className="h-1.5 w-8 bg-slate-100 rounded"></div>
                                    <div className="h-1.5 w-8 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}

export default CtaSection;