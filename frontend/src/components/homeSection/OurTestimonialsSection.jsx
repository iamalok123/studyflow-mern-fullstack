import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
    {
        quote: "StudyFlow completely changed how I prepare for exams. The AI flashcards and quizzes save me hours every week.",
        name: "Riya Sharma",
        role: "Computer Science Student",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"
    },
    {
        quote: "The ability to upload a 50-page research paper and instantly get a summary and practice questions is simply mind-blowing.",
        name: "Alex Chen",
        role: "Medical Resident",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150"
    },
    {
        quote: "I use the AI chat to explain complex engineering concepts from my textbook. It's like having a tutor available 24/7.",
        name: "Sarah Jenkins",
        role: "Engineering Major",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150"
    }
];

const OurTestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const current = testimonials[currentIndex];

    return (
        <section id='testimonials' className='py-20 md:py-24 px-4 md:px-16 lg:px-24 w-full bg-white overflow-hidden'>
            <div className="max-w-[1200px] mx-auto flex flex-col items-center animate-fade-in-up">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] mb-3">Testimonials</span>
                <h2 className="text-3xl md:text-4xl font-serif-display font-bold text-slate-900 mb-14">What Our Users Say</h2>

                <div className="relative w-full max-w-2xl bg-white rounded-4xl p-10 md:p-14 glow-shadow-lg border border-slate-100 flex flex-col items-center text-center transition-all duration-500">
                    <div className="absolute top-4 left-6 text-emerald-50 text-[6rem] font-serif leading-none select-none pointer-events-none">"</div>

                    <div className="flex gap-0.5 mb-6">
                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="size-4 fill-yellow-400 text-yellow-400" />)}
                    </div>

                    <div className="min-h-[120px] flex items-center justify-center mb-8 relative z-10">
                        <p className="text-lg md:text-xl text-slate-700 leading-relaxed italic animate-fade-in" key={currentIndex}>
                            "{current.quote}"
                        </p>
                    </div>

                    <div className="flex items-center gap-4 animate-fade-in" key={currentIndex + 'info'}>
                        <div className="size-12 rounded-full bg-linear-to-br from-emerald-200 to-teal-200 p-[3px]">
                            <img className="w-full h-full rounded-full object-cover border-2 border-white" src={current.image} alt={current.name} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800 text-sm">{current.name}</p>
                            <p className="text-xs text-slate-500">{current.role}</p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all duration-300 hover:scale-110 active:scale-95 z-20">
                        <ChevronLeftIcon className="size-5" />
                    </button>
                    <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all duration-300 hover:scale-110 active:scale-95 z-20">
                        <ChevronRightIcon className="size-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute -bottom-10 flex gap-2">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-200 hover:bg-emerald-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurTestimonialsSection;
