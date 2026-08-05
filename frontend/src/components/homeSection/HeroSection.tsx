import {
    ArrowRightIcon,
    BarChart3Icon,
    BookOpenCheckIcon,
    BrainCircuitIcon,
    CheckIcon,
    Clock3Icon,
    FileTextIcon,
    GraduationCapIcon,
    MessageCircleIcon,
    PlayCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UploadCloudIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const activityItems = [
    { label: "PDF processed", value: "94%", icon: FileTextIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Quiz accuracy", value: "82%", icon: BarChart3Icon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Cards reviewed", value: "128", icon: BookOpenCheckIcon, color: "text-orange-600", bg: "bg-orange-50" },
];

const HeroSection = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-[#F7FAF9] px-4 pt-28 pb-12 sm:px-6 md:pt-32 md:pb-16 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(20,184,166,0.12),transparent_26%)]" />
            <div className="relative mx-auto max-w-300">
                <div className="rounded-4xl border border-slate-200/80 bg-white/90 px-4 py-7 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur md:px-8 md:py-10 lg:px-12">
                    <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
                        <div className="flex flex-col items-start">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                                <SparklesIcon className="size-3.5 text-emerald-600" />
                                AI study workspace for PDFs
                            </div>

                            <h1 className="max-w-2xl text-4xl font-black leading-[1.03] text-slate-950 sm:text-5xl lg:text-6xl">
                                Turn dense documents into a clear study flow.
                            </h1>

                            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 md:text-lg">
                                Upload PDFs and instantly generate summaries, flashcards, quizzes, and contextual AI explanations powered by Google Gemini.
                            </p>

                            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <button
                                    onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
                                >
                                    Start learning free
                                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <a
                                    href="#features"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
                                >
                                    <PlayCircleIcon className="size-4 text-emerald-600" />
                                    Explore features
                                </a>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <CheckIcon className="size-3.5 text-emerald-600" />
                                    Free forever
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <ShieldCheckIcon className="size-3.5 text-emerald-600" />
                                    Secure PDF storage
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock3Icon className="size-3.5 text-emerald-600" />
                                    Ready in seconds
                                </span>
                            </div>

                            <div className="mt-8 grid w-full grid-cols-3 gap-3 border-t border-slate-200 pt-6 sm:max-w-lg">
                                {[
                                    ["10K+", "Docs studied"],
                                    ["50K+", "Cards created"],
                                    ["4.9/5", "Learner rating"],
                                ].map(([value, label]) => (
                                    <div key={label}>
                                        <p className="text-xl font-black text-slate-950 md:text-2xl">{value}</p>
                                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-145">
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                                <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                                    <span className="size-2 rounded-full bg-red-400" />
                                    <span className="size-2 rounded-full bg-yellow-400" />
                                    <span className="size-2 rounded-full bg-emerald-400" />
                                    <div className="ml-4 h-5 flex-1 rounded-full bg-white/10" />
                                </div>

                                <div className="grid gap-2 rounded-[1.25rem] bg-[#EEF6F2] p-3 sm:grid-cols-[0.86fr_1fr] sm:p-4">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Document</p>
                                                <p className="mt-1 text-lg font-black text-slate-950">Neural Notes.pdf</p>
                                            </div>
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                                                <UploadCloudIcon className="size-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="h-3 w-full rounded-full bg-slate-100" />
                                            <div className="h-3 w-10/12 rounded-full bg-slate-100" />
                                            <div className="h-3 w-8/12 rounded-full bg-slate-100" />
                                        </div>

                                        <div className="mt-6 rounded-2xl bg-slate-50 p-3">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-xs font-black text-slate-700">Learning queue</p>
                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">Live</span>
                                            </div>
                                            <div className="space-y-2">
                                                {activityItems.map((item) => (
                                                    <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
                                                        <div className={`flex size-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                                                            <item.icon className="size-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-bold text-slate-700">{item.label}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-950">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-sm font-black text-slate-950">Quiz preview</p>
                                                <GraduationCapIcon className="size-5 text-emerald-600" />
                                            </div>
                                            <div className="space-y-2">
                                                {["What does retrieval practice improve?", "Long term recall", "Page count", "File size"].map((item, index) => (
                                                    <div
                                                        key={item}
                                                        className={`rounded-xl border px-3 py-2 text-xs font-bold ${index === 1 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <MessageCircleIcon className="size-4 text-blue-600" />
                                                <p className="text-sm font-black text-slate-950">AI explanation</p>
                                            </div>
                                            <p className="text-xs font-semibold leading-5 text-slate-600">
                                                Retrieval practice strengthens memory by actively recalling ideas instead of rereading them.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 shadow-sm">
                                    <p className="text-[11px] font-black uppercase tracking-wide text-lime-800">Study lift</p>
                                    <p className="mt-1 text-2xl font-black text-slate-950">32%</p>
                                    <p className="text-xs font-semibold text-slate-600">faster reviews</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <BrainCircuitIcon className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Gemini AI</p>
                                            <p className="text-xs font-semibold text-slate-500">context aware</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
