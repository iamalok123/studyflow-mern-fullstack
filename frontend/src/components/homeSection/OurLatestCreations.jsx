import { FileTextIcon, LayersIcon, TargetIcon, MessageSquareIcon } from 'lucide-react';

const FeaturesGrid = () => {
    const features = [
        { title: 'Smart Document Management', description: 'Secure PDF upload, rename, delete, and automatic text extraction.', icon: FileTextIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'AI Flashcards', description: 'Generate spaced repetition flashcards in seconds from any document.', icon: LayersIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'Adaptive Quizzes', description: 'Create customizable quizzes with configurable difficulty levels.', icon: TargetIcon, color: 'text-teal-500', bg: 'bg-teal-50' },
        { title: 'AI Chat & Explanation', description: 'Ask questions about your document and receive contextual answers.', icon: MessageSquareIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <section id="features" className="py-20 md:py-24 px-4 md:px-16 lg:px-24 w-full bg-white">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-14 animate-fade-in-up">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] mb-3 block">Features</span>
                    <h2 className="text-3xl md:text-4xl font-serif-display font-bold text-slate-900 mb-3">Why Choose StudyFlow</h2>
                    <p className="text-base text-slate-500 max-w-xl mx-auto">Everything you need to turn static documents into an interactive learning experience.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="group flex flex-col p-7 md:p-8 bg-white rounded-2xl border border-slate-100 glow-shadow card-lift animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                            <div className={`size-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                                <f.icon className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 font-sans">{f.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturesGrid;