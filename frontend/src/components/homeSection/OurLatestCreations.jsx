import { FileTextIcon, LayersIcon, TargetIcon, MessageSquareIcon, ArrowRightIcon } from 'lucide-react';

const features = [
    {
        title: 'Smart Document Management',
        description: 'Secure PDF upload to Cloudinary, rename, delete, and automatic text extraction into searchable chunks.',
        icon: FileTextIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        hoverBorder: 'hover:border-blue-300',
        accent: 'from-blue-500 to-indigo-500',
    },
    {
        title: 'AI Flashcard Generation',
        description: 'Generate spaced repetition flashcards in seconds. Star your favourites and track review progress.',
        icon: LayersIcon,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-300',
        accent: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Adaptive Quizzes',
        description: 'Create customizable MCQ quizzes with configurable difficulty. See detailed results and explanations.',
        icon: TargetIcon,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-100',
        hoverBorder: 'hover:border-teal-300',
        accent: 'from-teal-500 to-cyan-500',
    },
    {
        title: 'AI Chat & Explanation',
        description: 'Ask questions about your document and receive contextual answers with your full chat history saved.',
        icon: MessageSquareIcon,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        hoverBorder: 'hover:border-orange-300',
        accent: 'from-orange-500 to-amber-500',
    },
];

const FeaturesGrid = () => {
    return (
        <section id="features" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 w-full bg-[#F3F6F9]">
            <div className="max-w-[1200px] mx-auto">

                {/* Section header */}
                <div className="text-center mb-14 animate-fade-in-up">
                    <span className="inline-block text-xs font-bold text-emerald-700 uppercase tracking-[0.2em] mb-3 px-3 py-1 bg-emerald-100 rounded-full">Features</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.02em' }}>
                        Why Choose StudyFlow
                    </h2>
                    <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                        Everything you need to turn static documents into an interactive, AI-powered learning experience.
                    </p>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`group relative flex flex-col p-8 bg-white rounded-2xl border-2 ${f.border} ${f.hoverBorder} shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up overflow-hidden`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {/* Accent gradient top edge */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

                            <div className={`size-13 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`} style={{ width: '52px', height: '52px' }}>
                                <f.icon className="size-6" strokeWidth={1.75} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed flex-1">{f.description}</p>
                            <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                Learn more <ArrowRightIcon className="size-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturesGrid;