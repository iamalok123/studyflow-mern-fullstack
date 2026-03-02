import { SparklesIcon, LayersIcon, CheckCircle2Icon, FileTextIcon, MessageCircleIcon } from 'lucide-react';

const capabilities = [
    { title: 'Flashcard Generation', description: 'Turn PDF chapters into spaced-repetition flashcards instantly.', icon: LayersIcon, gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/30' },
    { title: 'Quiz Creation', description: 'Create adaptive MCQ quizzes to test your comprehension.', icon: CheckCircle2Icon, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/30' },
    { title: 'Smart Summaries', description: 'Extract concise summaries from dense documents in one click.', icon: FileTextIcon, gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/30' },
    { title: 'Contextual AI Chat', description: 'Conversational AI that actually understands your document.', icon: MessageCircleIcon, gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/30' },
];

const AiCapabilitiesSection = () => {
    return (
        <section id='capabilities' className='py-20 md:py-28 px-4 md:px-16 lg:px-24 w-full bg-white relative overflow-hidden'>

            {/* Top separator line */}
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-300/60 to-transparent" />

            {/* Ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/80 rounded-full blur-[120px] -z-10" />

            <div className="max-w-[1200px] mx-auto">

                {/* Header */}
                <div className='flex flex-col items-center mb-14 animate-fade-in-up'>
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs mb-5 border border-emerald-200 shadow-sm">
                        <SparklesIcon className="size-3.5" />
                        Powered by Google Gemini AI
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-3" style={{ fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.02em' }}>
                        Your Personal AI Tutor
                    </h2>
                    <p className="text-base text-slate-600 text-center max-w-lg leading-relaxed">
                        Four powerful AI tools that work together to help you learn faster and retain more.
                    </p>
                </div>

                {/* Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    {capabilities.map((cap, i) => (
                        <div
                            key={i}
                            className='group flex flex-col items-center text-center p-7 rounded-2xl bg-white border-2 border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up'
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {/* Icon — gradient fill on hover */}
                            <div className={`size-[56px] rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center mb-5 text-slate-500 group-hover:bg-linear-to-br group-hover:${cap.gradient} group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:${cap.shadow} transition-all duration-300`}>
                                <cap.icon className='size-6' strokeWidth={1.75} />
                            </div>
                            <h3 className='text-base font-bold text-slate-800 mb-2'>{cap.title}</h3>
                            <p className='text-sm text-slate-600 leading-relaxed'>{cap.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AiCapabilitiesSection;