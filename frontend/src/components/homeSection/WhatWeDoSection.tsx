import { ArrowRightIcon, CheckIcon, DatabaseIcon, FileUpIcon, Layers3Icon, MessagesSquareIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const highlights = [
    "Context-aware AI chat with memory",
    "Spaced repetition flashcards",
    "Adaptive quiz difficulty",
    "Secure Cloudinary PDF storage",
];

const workflow = [
    { icon: FileUpIcon, title: "Upload", text: "Drop in lecture PDFs, notes, or research papers." },
    { icon: ZapIcon, title: "Generate", text: "Create summaries, quizzes, cards, and explanations." },
    { icon: Layers3Icon, title: "Review", text: "Study with a focused dashboard built for retention." },
];

const WhatWeDoSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <section id="how-it-works" className="bg-[#F7FAF9] px-4 py-16 md:px-16 md:py-24 lg:px-24">
            <div className="mx-auto grid max-w-300 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                    <div className="flex flex-col items-start">
                        <span className="mb-4 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            How it works
                        </span>
                        <h2 className="max-w-xl text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                            A complete learning system, not another file viewer.
                        </h2>
                        <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-600">
                            StudyFlow combines document management, AI intelligence, and interactive practice tools so students can understand faster and retain longer.
                        </p>

                        <ul className="mt-7 space-y-3">
                            {highlights.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <CheckIcon className="size-3.5" strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                            className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
                        >
                            Start learning
                            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="grid gap-4 md:grid-cols-[0.85fr_1fr]">
                            <div className="space-y-4">
                                {workflow.map((step, index) => (
                                    <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                                                <step.icon className="size-5" />
                                            </div>
                                            <span className="text-xs font-black text-slate-300">0{index + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{step.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                                <div className="rounded-[1.25rem] bg-[#EEF6F2] p-4">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Study dashboard</p>
                                            <p className="mt-1 text-2xl font-black text-slate-950">Today</p>
                                        </div>
                                        <div className="flex size-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                                            <DatabaseIcon className="size-5" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                                            <p className="text-xs font-bold text-slate-500">Quizzes</p>
                                            <p className="mt-2 text-3xl font-black text-slate-950">14</p>
                                        </div>
                                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                                            <p className="text-xs font-bold text-slate-500">Retention</p>
                                            <p className="mt-2 text-3xl font-black text-emerald-600">91%</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-black text-slate-950">Progress map</p>
                                            <ShieldCheckIcon className="size-4 text-emerald-600" />
                                        </div>
                                        <div className="flex h-24 items-end gap-2">
                                            {[40, 58, 48, 74, 62, 86, 70].map((height, index) => (
                                                <div key={index} className="flex-1 rounded-t-xl bg-linear-to-t from-emerald-500 to-lime-300" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
                                        <div className="mb-3 flex items-center gap-2">
                                            <MessagesSquareIcon className="size-4 text-lime-300" />
                                            <p className="text-sm font-black">AI tutor is ready</p>
                                        </div>
                                        <p className="text-xs font-medium leading-5 text-slate-300">
                                            Ask for simpler explanations, examples, or practice questions from the exact PDF context.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </section>
    );
}

export default WhatWeDoSection;
