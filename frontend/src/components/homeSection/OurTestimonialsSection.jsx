import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon, StarIcon, TrendingUpIcon } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
    {
        quote: "StudyFlow completely changed how I prepare for exams. The AI flashcards and quizzes save me hours every week.",
        name: "Riya Sharma",
        role: "Computer Science Student",
        initials: "RS",
        color: "from-emerald-400 to-teal-500",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"
    },
    {
        quote: "The ability to upload a 50-page research paper and instantly get a summary and practice questions is mind-blowing.",
        name: "Alex Chen",
        role: "Medical Resident",
        initials: "AC",
        color: "from-blue-400 to-indigo-500",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150"
    },
    {
        quote: "I use the AI chat to explain complex engineering concepts from my textbook. It's like having a tutor available 24/7.",
        name: "Sarah Jenkins",
        role: "Engineering Major",
        initials: "SJ",
        color: "from-violet-400 to-purple-500",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150"
    }
];

const storyCards = [
    { label: "Before", title: "A long PDF and no plan", text: "Students start with too much material and no clear practice path." },
    { label: "After", title: "A guided review session", text: "The same file becomes summaries, flashcards, quizzes, and answers." },
];

const OurTestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    const current = testimonials[currentIndex];

    return (
        <section id='testimonials' className='w-full overflow-hidden bg-[#F7FAF9] px-4 py-16 md:px-16 md:py-24 lg:px-24'>
            <div className="mx-auto max-w-300">
                <div className="grid items-center gap-10 rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
                    <div>
                        <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            Learner stories
                        </span>
                        <h2 className="max-w-md text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                            The payoff is less chaos and more momentum.
                        </h2>
                        <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600">
                            The product story is simple: learners arrive with a document, then leave with a route through it.
                        </p>

                        <div className="mt-8 space-y-3">
                            {storyCards.map((card) => (
                                <div key={card.label} className="rounded-2xl border border-slate-200 bg-[#F7FAF9] p-4">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">{card.label}</p>
                                    <h3 className="mt-2 text-lg font-black text-slate-950">{card.title}</h3>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{card.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-lime-300 text-slate-950">
                                <TrendingUpIcon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xl font-black">4.9/5</p>
                                <p className="text-xs font-semibold text-slate-300">average learning experience rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#EEF6F2] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:p-6">
                            <div className="absolute right-6 top-6 text-emerald-100">
                                <QuoteIcon className="size-20 fill-emerald-100 text-emerald-100" />
                            </div>

                            <div className="relative rounded-2xl bg-white p-6 shadow-sm md:p-8">
                                <div className="mb-7 flex items-center justify-between gap-4">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <StarIcon key={i} className="size-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                        Student verified
                                    </div>
                                </div>

                                <div className="min-h-37.5">
                                    <p className="text-xl font-bold leading-8 text-slate-800 md:text-2xl" key={currentIndex}>
                                        "{current.quote}"
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
                                    <div className="flex items-center gap-4 animate-fade-in" key={currentIndex + 'info'}>
                                        <div className={`relative size-12 shrink-0 rounded-full bg-linear-to-br ${current.color} p-0.5`}>
                                            <span className="absolute inset-0.5 flex items-center justify-center rounded-full bg-white text-xs font-black text-slate-700">
                                                {current.initials}
                                            </span>
                                            <img
                                                className="relative h-full w-full rounded-full border-2 border-white object-cover"
                                                src={current.image}
                                                alt={current.name}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-950">{current.name}</p>
                                            <p className="text-xs font-semibold text-slate-500">{current.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={prevTestimonial}
                                            className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:text-emerald-600 active:scale-95"
                                        >
                                            <ChevronLeftIcon className="size-5" />
                                        </button>
                                        <button
                                            onClick={nextTestimonial}
                                            className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:text-emerald-600 active:scale-95"
                                        >
                                            <ChevronRightIcon className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-center gap-2">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white hover:bg-emerald-200'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurTestimonialsSection;
