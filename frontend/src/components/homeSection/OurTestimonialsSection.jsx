import { ChevronLeftIcon, ChevronRightIcon, StarIcon, QuoteIcon } from 'lucide-react';
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

const OurTestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    const current = testimonials[currentIndex];

    return (
        <section id='testimonials' className='py-20 md:py-28 px-4 md:px-16 lg:px-24 w-full bg-[#F3F6F9] overflow-hidden'>
            <div className="max-w-[1200px] mx-auto flex flex-col items-center animate-fade-in-up">

                <span className="inline-block text-xs font-bold text-emerald-700 uppercase tracking-[0.2em] mb-3 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">Testimonials</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 text-center" style={{ fontFamily: 'Urbanist, sans-serif', letterSpacing: '-0.02em' }}>
                    What Our Users Say
                </h2>
                <p className="text-base text-slate-600 mb-14 text-center max-w-md">Real feedback from students and professionals using StudyFlow every day.</p>

                <div className="relative w-full max-w-2xl">
                    {/* Main testimonial card */}
                    <div className="relative bg-white rounded-3xl p-10 md:p-14 border-2 border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col items-center text-center transition-all duration-500">

                        {/* Big decorative quote */}
                        <div className="absolute top-6 left-8 text-emerald-100 select-none pointer-events-none">
                            <QuoteIcon className="size-16 fill-emerald-100 text-emerald-100" />
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5 mb-6 z-10 relative">
                            {[1, 2, 3, 4, 5].map(i => (
                                <StarIcon key={i} className="size-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>

                        {/* Quote */}
                        <div className="min-h-[100px] flex items-center justify-center mb-8 relative z-10">
                            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium animate-fade-in" key={currentIndex}>
                                "{current.quote}"
                            </p>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-4 animate-fade-in" key={currentIndex + 'info'}>
                            <div className={`size-12 rounded-full bg-linear-to-br ${current.color} p-[2px] shrink-0`}>
                                <img
                                    className="w-full h-full rounded-full object-cover border-2 border-white"
                                    src={current.image}
                                    alt={current.name}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800 text-sm">{current.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{current.role}</p>
                            </div>
                        </div>

                        {/* Nav: prev */}
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-11 rounded-full bg-white shadow-lg border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:scale-110 active:scale-95 transition-all duration-200 z-20"
                        >
                            <ChevronLeftIcon className="size-5" />
                        </button>

                        {/* Nav: next */}
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-11 rounded-full bg-white shadow-lg border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:scale-110 active:scale-95 transition-all duration-200 z-20"
                        >
                            <ChevronRightIcon className="size-5" />
                        </button>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex gap-2 justify-center mt-8">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 hover:bg-emerald-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurTestimonialsSection;
