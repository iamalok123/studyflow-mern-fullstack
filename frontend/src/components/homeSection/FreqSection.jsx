import { CheckCircle2Icon, FileTextIcon, LayersIcon, MessageCircleIcon, SparklesIcon } from 'lucide-react';

const capabilities = [
    { title: 'Flashcard Generation', description: 'Turn PDF chapters into spaced-repetition flashcards instantly.', icon: LayersIcon, iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { title: 'Quiz Creation', description: 'Create adaptive MCQ quizzes to test your comprehension.', icon: CheckCircle2Icon, iconClass: 'bg-blue-50 text-blue-600 border-blue-100' },
    { title: 'Smart Summaries', description: 'Extract concise summaries from dense documents in one click.', icon: FileTextIcon, iconClass: 'bg-violet-50 text-violet-600 border-violet-100' },
    { title: 'Contextual AI Chat', description: 'Conversational AI that actually understands your document.', icon: MessageCircleIcon, iconClass: 'bg-orange-50 text-orange-600 border-orange-100' },
];

const AiCapabilitiesSection = () => {
    return (
        <section id='capabilities' className='w-full bg-[#F7FAF9] px-4 py-16 md:px-16 md:py-24 lg:px-24'>
            <div className="mx-auto max-w-300">
                <div className="grid items-center gap-10 rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-8 lg:grid-cols-[1fr_0.95fr] lg:p-10">
                    <div className="order-2 lg:order-1">
                        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                            <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                                <span className="size-2 rounded-full bg-red-400" />
                                <span className="size-2 rounded-full bg-yellow-400" />
                                <span className="size-2 rounded-full bg-emerald-400" />
                                <div className="ml-4 h-5 flex-1 rounded-full bg-white/10" />
                            </div>

                            <div className="rounded-[1.25rem] bg-[#EEF6F2] p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">AI tutor session</p>
                                        <p className="mt-1 text-2xl font-black text-slate-950">Photosynthesis notes</p>
                                    </div>
                                    <div className="flex size-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                                        <SparklesIcon className="size-5" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="max-w-[82%] rounded-2xl bg-white p-4 shadow-sm">
                                        <p className="text-sm font-black text-slate-950">Explain this page simply.</p>
                                        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">Use my uploaded PDF context only.</p>
                                    </div>
                                    <div className="ml-auto max-w-[86%] rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
                                        <p className="text-sm font-black">Here is the simple version.</p>
                                        <p className="mt-2 text-xs font-medium leading-5 text-slate-300">
                                            Plants use light energy to turn carbon dioxide and water into glucose, then release oxygen as a result.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {['Summarize', 'Quiz me', 'Make cards'].map((item) => (
                                        <div key={item} className="rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-slate-700 shadow-sm">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-xs font-black text-emerald-800 shadow-sm">
                            <SparklesIcon className="size-3.5" />
                            Powered by Google Gemini AI
                        </div>
                        <h2 className="max-w-lg text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                            Your tutor follows the document, not a generic script.
                        </h2>
                        <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-600">
                            Each AI tool is framed around the same source material, so summaries, questions, cards, and chat answers feel connected.
                        </p>

                        <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            {capabilities.map((cap) => (
                                <div
                                    key={cap.title}
                                    className='group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60'
                                >
                                    <div className={`mb-4 flex size-11 items-center justify-center rounded-xl border ${cap.iconClass}`}>
                                        <cap.icon className='size-5' strokeWidth={1.75} />
                                    </div>
                                    <h3 className='mb-2 text-base font-black text-slate-950'>{cap.title}</h3>
                                    <p className='text-sm font-medium leading-6 text-slate-600'>{cap.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AiCapabilitiesSection;
