import React from 'react'
import { ArrowRightIcon } from 'lucide-react';

const Banner = () => {
    return (
        <div className="flex w-full flex-wrap items-center justify-center bg-linear-to-r from-blue-600 to-blue-400 py-2 text-center font-medium text-white">
            <p>Start your learning journey today and master new skills!</p>
            <a href="/register" className="ml-3 flex items-center gap-1 rounded-md bg-white px-3 py-1 text-blue-600 transition hover:bg-slate-200 active:scale-95">
                Start Learning
                <ArrowRightIcon className="size-3.5" />
            </a>
        </div>
    );
}

export default Banner