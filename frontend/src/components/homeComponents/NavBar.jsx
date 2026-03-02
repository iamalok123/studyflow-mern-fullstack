import { MenuIcon, XIcon, BrainCircuitIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

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
            <nav className='fixed top-4 left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between bg-white/40 px-5 py-3.5 backdrop-blur-2xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300'>
                <a href='/' className='flex items-center gap-2.5 group'>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/20 group-hover:shadow-md group-hover:shadow-emerald-500/30 transition-all">
                        <img src="logo2.svg" alt="logo" className='w-16 h-16' />
                    </div>
                    <span className='font-bold text-lg text-slate-800 tracking-tight'>StudyFlow</span>
                </a>

                <div className='hidden items-center gap-8 font-medium text-slate-600 md:flex text-[0.85rem]'>
                    {links.map((link) => (
                        <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="relative group/link transition-colors hover:text-emerald-700 font-semibold tracking-wide">
                            {link.name}
                            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-emerald-500 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="hidden items-center gap-4 md:flex">
                    {isAuthenticated ? (
                        <Link to='/dashboard' className='rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-2 font-bold text-white text-sm shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]'>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to='/login' className='rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-2 font-bold text-white text-sm shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]'>
                                Log In
                            </Link>
                            <Link to='/register' className='rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-2 font-bold text-white text-sm shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]'>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger toggle */}
                <button onClick={() => setIsOpen(true)} className='transition active:scale-90 md:hidden p-1.5 text-slate-700 bg-white/50 rounded-lg'>
                    <MenuIcon className='size-6' />
                </button>
            </nav>

            {/* Mobile Menu - Transparent Blur */}
            <div className={`fixed inset-0 z-60 flex flex-col items-center justify-center gap-6 bg-slate-900/40 text-lg font-medium backdrop-blur-3xl transition-all duration-500 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute top-6 left-6 flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/20">
                        <img src="logo2.svg" alt="logo" />
                    </div>
                    <span className='font-bold text-lg text-white tracking-tight'>StudyFlow</span>
                </div>

                {links.map((link, idx) => (
                    <a key={link.name} href={link.href} className='text-white/90 hover:text-white hover:scale-105 transition-all text-2xl font-semibold transform-gpu' style={{ transitionDelay: `${isOpen ? idx * 50 : 0}ms` }} onClick={(e) => handleNavClick(e, link.href)}>
                        {link.name}
                    </a>
                ))}

                <div className="flex flex-col items-center gap-4 mt-8 w-full px-12">
                    <Link to='/login' className='w-full text-center py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors font-semibold' onClick={() => setIsOpen(false)}>Log In</Link>
                    <Link to='/register' className='rounded-xl w-full text-center bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/30' onClick={() => setIsOpen(false)}>Get Started</Link>
                </div>

                <button onClick={() => setIsOpen(false)} className='absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all hover:rotate-90 duration-300'>
                    <XIcon className="size-6" />
                </button>
            </div>
        </>
    );
}

export default NavBar;