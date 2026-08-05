import { BrainCircuitIcon, Github, Linkedin, Twitter, Youtube } from "lucide-react";
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
        <footer className="w-full border-t border-slate-200 bg-white px-4 pb-8 pt-16 text-slate-600 md:px-16 lg:px-24">
            <div className="max-w-300 mx-auto flex flex-col md:flex-row flex-wrap justify-between gap-10 md:gap-0 mb-12">
                <div className="w-full md:w-[35%] md:pr-6">
                    <Link to="/" className="flex items-center gap-2 mb-5 group">
                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/20">
                            <BrainCircuitIcon className="size-5" />
                        </div>
                        <span className='text-lg font-black text-slate-950'>StudyFlow</span>
                    </Link>
                    <p className="text-sm leading-relaxed mb-6 max-w-xs text-slate-500">AI-powered document learning assistant built with MERN & Google Gemini.</p>
                    <div className="flex items-center gap-2.5">
                        {socials.map((social, i) => (
                            <a key={i} href={social.href} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:text-emerald-600">
                                <social.icon className="size-4" />
                            </a>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-[65%] flex flex-wrap justify-between gap-8">
                    {columns.map((col, i) => (
                        <div key={i} className="min-w-30">
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
            <div className="max-w-300 mx-auto pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
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
