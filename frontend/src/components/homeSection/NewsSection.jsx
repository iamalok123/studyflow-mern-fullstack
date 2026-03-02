import { SparklesIcon, FileUp, Zap, BookOpen, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = [
    { icon: FileUp, label: 'Upload PDF', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', num: '01' },
    { icon: Zap, label: 'AI Processes', color: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200', num: '02' },
    { icon: BookOpen, label: 'Start Learning', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', num: '03' },
];

const CtaSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <section className='relative py-28 px-4 w-full overflow-hidden bg-[#F3F6F9]'>

            {/* Dot grid background */}
            <div
                className="absolute inset-0 opacity-50 -z-10"
                style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            {/* Glowing orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] -z-10" />

            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-14 z-10 relative">

                {/* Left Text */}
                <div className="w-full lg:w-1/2 text-left animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-100 border border-emerald-200 mb-6 text-emerald-700 shadow-sm">
                        <SparklesIcon className="size-5" />
                    </div>

                    <h2 className='text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-slate-900 mb-6 leading-tight' style={{ fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.03em' }}>
                        Ready to Study{" "}
                        <span className="gradient-text">Smarter?</span>
                    </h2>

                    <p className='text-lg text-slate-600 mb-8 max-w-md leading-relaxed'>
                        Join thousands of students turning overwhelming PDFs into easy-to-digest flashcards and quizzes — instantly.
                    </p>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="group inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-teal-600 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-[0.98]"
                    >
                        Start Learning For Free
                        <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <p className="mt-4 text-xs text-slate-500 font-medium">✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime</p>
                </div>

                {/* Right — How it works steps */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">

                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">How it works</p>

                        <div className="flex flex-col gap-4">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-4 p-4 rounded-2xl bg-white border-2 ${step.border} shadow-sm hover:shadow-md transition-shadow duration-200 animate-float`}
                                    style={{ animationDelay: `${i * 0.4}s` }}
                                >
                                    <div className={`${step.bg} border-2 ${step.border} p-3 rounded-xl shrink-0`}>
                                        <step.icon className={`size-5 ${step.color}`} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{step.label}</p>
                                        <div className="h-1.5 w-20 bg-slate-100 rounded mt-1.5" />
                                    </div>
                                    <span className="text-xs font-black text-slate-300">{step.num}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom confirmation badge */}
                        <div className="mt-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-lg">✅</span>
                            <p className="text-xs font-semibold text-emerald-800">Your study session is ready in &lt;30 seconds</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default CtaSection;