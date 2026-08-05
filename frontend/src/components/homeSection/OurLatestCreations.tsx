import { ArrowRightIcon, CheckCircle2Icon, FileTextIcon, LayersIcon, MessageSquareIcon, TargetIcon } from 'lucide-react';

const features = [
    {
        title: 'Smart Document Management',
        description: 'Secure PDF upload to Cloudinary, rename, delete, and automatic text extraction into searchable chunks.',
        icon: FileTextIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        accent: 'from-blue-500 to-indigo-500',
        frame: 'bg-blue-50/70',
    },
    {
        title: 'AI Flashcard Generation',
        description: 'Generate spaced repetition flashcards in seconds. Star your favourites and track review progress.',
        icon: LayersIcon,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        accent: 'from-emerald-500 to-teal-500',
        frame: 'bg-emerald-50/70',
    },
    {
        title: 'Adaptive Quizzes',
        description: 'Create customizable MCQ quizzes with configurable difficulty. See detailed results and explanations.',
        icon: TargetIcon,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-100',
        accent: 'from-teal-500 to-cyan-500',
        frame: 'bg-teal-50/70',
    },
    {
        title: 'AI Chat & Explanation',
        description: 'Ask questions about your document and receive contextual answers with your full chat history saved.',
        icon: MessageSquareIcon,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        accent: 'from-orange-500 to-amber-500',
        frame: 'bg-orange-50/70',
    },
];

const storySteps = ['Upload a chapter', 'Generate practice', 'Review with context'];

const FeaturesGrid = () => {
    return (
        <section id="features" className="w-full bg-[#F7FAF9] px-4 py-16 md:px-16 md:py-24 lg:px-24">
            <div className="mx-auto max-w-300">
                <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-8 lg:p-10">
                    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
                        <div className="flex flex-col justify-between">
                            <div>
                                <span className="mb-4 inline-flex rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                                    Feature story
                                </span>
                                <h2 className="max-w-md text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                                    Every study action has a clear next scene.
                                </h2>
                                <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600">
                                    The interface moves learners from messy notes to structured practice without making them hunt through tools.
                                </p>
                            </div>

                            <div className="mt-8 rounded-2xl bg-[#EEF6F2] p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Study sequence</p>
                                    <CheckCircle2Icon className="size-5 text-emerald-600" />
                                </div>
                                <div className="space-y-3">
                                    {storySteps.map((step, index) => (
                                        <div key={step} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-black text-white">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-black text-slate-800">{step}</span>
                                            {index < storySteps.length - 1 && <ArrowRightIcon className="ml-auto size-4 text-slate-300" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {features.map((f, i) => (
                                <div
                                    key={f.title}
                                    className={`group relative min-h-61.25 overflow-hidden rounded-2xl border ${f.border} ${f.frame} p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70`}
                                    style={{ animationDelay: `${i * 0.08}s` }}
                                >
                                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div className={`flex size-12 items-center justify-center rounded-xl ${f.bg} ${f.color} transition-all duration-300 group-hover:scale-105`}>
                                                <f.icon className="size-6" strokeWidth={1.75} />
                                            </div>
                                            <span className="text-xs font-black text-slate-300">0{i + 1}</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-black text-slate-950">{f.title}</h3>
                                        <p className="text-sm font-medium leading-6 text-slate-600">{f.description}</p>
                                        <div className={`mt-5 h-1.5 rounded-full bg-linear-to-r ${f.accent}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FeaturesGrid;
