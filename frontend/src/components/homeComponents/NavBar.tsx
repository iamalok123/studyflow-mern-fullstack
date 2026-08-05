import { BrainCircuitIcon, MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/useAuth";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const links = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Features', href: '#features' },
        { name: 'AI Tutor', href: '#capabilities' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

    const handleNavClick = (e, href) => {
        setIsOpen(false);
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            <nav className='fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-300 -translate-x-1/2 items-center justify-between rounded-full border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 md:px-5'>
                <a href='/' className='flex items-center gap-2.5 group'>
                    <div className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/20 transition-all group-hover:shadow-md">
                        <BrainCircuitIcon className='size-5' />
                    </div>
                    <span className='text-lg font-black text-slate-950'>StudyFlow</span>
                </a>

                <div className='hidden items-center gap-7 text-[0.85rem] font-bold text-slate-600 md:flex'>
                    {links.map((link) => (
                        <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="group/link relative transition-colors hover:text-slate-950">
                            {link.name}
                            <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-emerald-500 transition-all duration-300 group-hover/link:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    {isAuthenticated ? (
                        <Link to='/dashboard' className='rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-950/15 transition-all duration-300 hover:bg-slate-800 active:scale-[0.98]'>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to='/login' className='rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]'>
                                Log In
                            </Link>
                            <Link to='/register' className='rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-950/15 transition-all duration-300 hover:bg-slate-800 active:scale-[0.98]'>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger toggle */}
                <button onClick={() => setIsOpen(true)} className='rounded-full bg-slate-100 p-2 text-slate-800 transition active:scale-90 md:hidden'>
                    <MenuIcon className='size-6' />
                </button>
            </nav>

            {/* Mobile Menu - Liquid Glass */}
            <div className={`fixed inset-0 z-60 flex flex-col items-center justify-center gap-6 bg-white/55 text-lg font-medium backdrop-blur-3xl transition-all duration-500 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-4 rounded-4xl border border-white/70 bg-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.14)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_14%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.16),transparent_26%)]" />

                <div className="absolute top-6 left-6 flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/20">
                        <BrainCircuitIcon className='size-5' />
                    </div>
                    <span className='text-lg font-black text-slate-950'>StudyFlow</span>
                </div>

                {links.map((link, idx) => (
                    <a key={link.name} href={link.href} className='relative z-10 rounded-full border border-white/70 bg-white/55 px-7 py-3 text-2xl font-black text-slate-950 shadow-sm shadow-slate-200/60 backdrop-blur transition-all hover:scale-105 hover:bg-white/80 active:scale-[0.98]' style={{ transitionDelay: `${isOpen ? idx * 50 : 0}ms` }} onClick={(e) => handleNavClick(e, link.href)}>
                        {link.name}
                    </a>
                ))}

                <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-4 px-12">
                    <Link to='/login' className='w-full rounded-full border border-slate-200/80 bg-white/45 py-3.5 text-center font-bold text-slate-800 shadow-sm backdrop-blur transition-colors hover:bg-white/80' onClick={() => setIsOpen(false)}>Log In</Link>
                    <Link to='/register' className='w-full rounded-full bg-slate-950 px-8 py-3.5 text-center font-bold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-slate-800' onClick={() => setIsOpen(false)}>Get Started</Link>
                </div>

                <button onClick={() => setIsOpen(false)} className='absolute right-6 top-6 z-10 rounded-full border border-white/70 bg-white/55 p-2 text-slate-950 shadow-sm backdrop-blur transition-all duration-300 hover:rotate-90 hover:bg-white/80'>
                    <XIcon className="size-6" />
                </button>
            </div>
        </>
    );
}

export default NavBar;
