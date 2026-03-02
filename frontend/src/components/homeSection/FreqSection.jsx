import { SparklesIcon, LayersIcon, CheckCircle2Icon, FileTextIcon, MessageCircleIcon } from 'lucide-react';

const AiCapabilitiesSection = () => {
    const capabilities = [
        { title: 'Flashcard Generation', description: 'Turn PDF chapters into spaced-repetition flashcards.', icon: LayersIcon },
        { title: 'Quiz Creation', description: 'Create adaptive quizzes to test comprehension.', icon: CheckCircle2Icon },
        { title: 'Smart Summaries', description: 'Extract concise summaries from dense papers.', icon: FileTextIcon },
        { title: 'Contextual AI Chat', description: 'Conversational AI that understands your documents.', icon: MessageCircleIcon },
    ];

    return (
        <section id='capabilities' className='py-20 md:py-24 px-4 md:px-16 lg:px-24 w-full bg-[#F8FAFB] relative overflow-hidden'>
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-200/40 to-transparent"></div>
            <div className="max-w-[1200px] mx-auto">
                <div className='flex flex-col items-center mb-14 animate-fade-in-up'>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs mb-5 border border-emerald-100">
                        <SparklesIcon className="size-3.5" />
                        Powered by Google Gemini AI
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif-display font-bold text-slate-900 text-center">Your Personal AI Tutor</h2>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    {capabilities.map((cap, i) => (
                        <div key={i} className='group flex flex-col items-center text-center p-7 rounded-2xl bg-white border border-slate-100 glow-shadow card-lift animate-fade-in-up' style={{ animationDelay: `${i * 0.08}s` }}>
                            <div className='size-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 text-emerald-500 group-hover:bg-linear-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300'>
                                <cap.icon className='size-6' />
                            </div>
                            <h3 className='text-base font-bold text-slate-800 mb-2 font-sans'>{cap.title}</h3>
                            <p className='text-xs text-slate-500 leading-relaxed'>{cap.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AiCapabilitiesSection;