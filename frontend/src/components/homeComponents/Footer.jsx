import { Dribbble, Linkedin, Twitter, Youtube, BrainCircuitIcon, Github } from "lucide-react";
import { Link } from 'react-router-dom';

const Footer = () => {
    const columns = [
        { title: 'Product', links: [{ text: 'Features', href: '#features' }, { text: 'Pricing', href: '#pricing' }, { text: 'Docs', href: '#docs' }, { text: 'Security', href: '#' }] },
        { title: 'Resources', links: [{ text: 'API', href: '#' }, { text: 'Blog', href: '#' }, { text: 'Support', href: '#' }] },
        { title: 'Contact', links: [{ text: 'support@studyflow.ai', href: 'mailto:support@studyflow.ai' }] },
    ];

    const socials = [
        { icon: Twitter, href: 'https://x.com/_alok_h' },
        { icon: Linkedin, href: 'https://www.linkedin.com/in/alok-hotta/' },
        { icon: Youtube, href: 'https://www.youtube.com/@studyflow_ai' },
        { icon: Github, href: 'https://github.com/iamalok123' },
    ];

    return (
        <footer className="w-full bg-slate-50 text-slate-600 pt-16 pb-8 px-4 md:px-16 lg:px-24 border-t border-slate-200">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-wrap justify-between gap-10 md:gap-0 mb-12">
                <div className="w-full md:w-[35%] md:pr-6">
                    <Link to="/" className="flex items-center gap-2 mb-5 group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-500/20">
                            <img src="logo2.svg" alt="logo" className='w-16 h-16' />
                        </div>
                        <span className='font-bold text-lg text-slate-900 tracking-tight'>StudyFlow</span>
                    </Link>
                    <p className="text-sm leading-relaxed mb-6 max-w-xs text-slate-500">AI-powered document learning assistant built with MERN & Google Gemini.</p>
                    <div className="flex items-center gap-2.5">
                        {socials.map((social, i) => (
                            <a key={i} href={social.href} className="p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition-all duration-300 text-slate-500 hover:-translate-y-1">
                                <social.icon className="size-4" />
                            </a>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-[65%] flex flex-wrap justify-between gap-8">
                    {columns.map((col, i) => (
                        <div key={i} className="min-w-[120px]">
                            <h3 className="font-semibold text-slate-900 mb-4 text-xs uppercase tracking-widest">{col.title}</h3>
                            <ul className="space-y-3">
                                {col.links.map((link, j) => (
                                    <li key={j}><a href={link.href} className="text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors">{link.text}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="max-w-[1200px] mx-auto pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p>© 2026 StudyFlow. All rights reserved.</p>
                <div className="flex gap-5">
                    <a href="#" className="hover:text-emerald-600 transition-colors font-medium">Privacy Policy</a>
                    <a href="#" className="hover:text-emerald-600 transition-colors font-medium">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;