import { ArrowRightIcon, BookOpen, CheckCircle2Icon, FileUp, SparklesIcon, Zap } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
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
        <section className='relative w-full overflow-hidden bg-[#F7FAF9] px-4 py-24 md:py-28'>

            {/* Dot grid background */}
            <div
                className="absolute inset-0 opacity-60"
                style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            <div className="max-w-300 mx-auto flex flex-col lg:flex-row items-center justify-between gap-14 z-10 relative">

                {/* Left Text */}
                <div className="w-full lg:w-1/2 text-left animate-fade-in-up">
                    <div className="mb-6 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 shadow-sm">
                        <SparklesIcon className="size-5" />
                    </div>

                    <h2 className='mb-6 text-4xl font-black leading-tight text-slate-950 md:text-5xl lg:text-[3.25rem]'>
                        Ready to Study{" "}
                        <span className="gradient-text">Smarter?</span>
                    </h2>

                    <p className='mb-8 max-w-md text-lg font-medium leading-8 text-slate-600'>
                        Join thousands of students turning overwhelming PDFs into easy-to-digest flashcards and quizzes, instantly.
                    </p>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="group inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-8 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
                    >
                        Start Learning For Free
                        <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <p className="mt-4 text-xs font-bold text-slate-500">Free forever · No credit card · Cancel anytime</p>
                </div>

                {/* Right side workflow steps */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">

                        <p className="mb-6 text-xs font-black uppercase tracking-widest text-slate-500">How it works</p>

                        <div className="flex flex-col gap-4">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-4 rounded-lg border ${step.border} bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md animate-float`}
                                    style={{ animationDelay: `${i * 0.4}s` }}
                                >
                                    <div className={`${step.bg} border ${step.border} shrink-0 rounded-lg p-3`}>
                                        <step.icon className={`size-5 ${step.color}`} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-950">{step.label}</p>
                                        <div className="h-1.5 w-20 bg-slate-100 rounded mt-1.5" />
                                    </div>
                                    <span className="text-xs font-black text-slate-300">{step.num}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom confirmation badge */}
                        <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
                            <CheckCircle2Icon className="size-5 shrink-0 text-emerald-700" />
                            <p className="text-xs font-bold text-emerald-800">Your study session is ready in &lt;30 seconds</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default CtaSection;
