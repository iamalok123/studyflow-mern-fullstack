import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

const withoutNode = (props) => {
  const nextProps = { ...props };
  delete nextProps.node;
  return nextProps;
};

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md text-slate-100 font-mono text-xs sm:text-sm">
      {/* Code Block Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-bold uppercase tracking-wider text-emerald-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Output */}
      <div className="p-3.5 overflow-x-auto leading-relaxed">
        <pre className="m-0 bg-transparent p-0">
          <code className="whitespace-pre font-mono text-slate-100">{code}</code>
        </pre>
      </div>
    </div>
  );
};

const normalizeMarkdown = (raw) => {
  if (typeof raw !== 'string' || !raw.trim()) return '';

  let str = raw;

  // Fix squished code tags like "* Syntax: sql SELECT..." or "Example: python def..." into proper fenced code blocks
  str = str.replace(
    /(\*?\s*(?:Syntax|Example|Code):\s*)(sql|javascript|js|python|html|css|json|java|cpp|csharp)\s+([^\n]+)/gi,
    (match, prefix, lang, code) => {
      if (code.includes('```')) return match;
      return `${prefix}\n\n\`\`\`${lang.toLowerCase()}\n${code.trim()}\n\`\`\`\n`;
    }
  );

  // Fix squished bullets where bullet markers (* or •) are joined without newlines
  str = str.replace(/([^\n])(\s*[•*]\s+[A-Z0-9])/g, '$1\n$2');

  return str;
};

const MarkdownRenderer = ({ content }) => {
  // Input Guardrail: Ensure string content and format markdown
  const safeContent = typeof content === 'string'
    ? normalizeMarkdown(content)
    : (content ? normalizeMarkdown(String(content)) : '');

  if (!safeContent) return null;

  return (
    <div className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-lg sm:text-xl font-bold mt-4 mb-2 text-slate-900 pb-1 border-b border-slate-200/60" {...withoutNode(props)} />
          ),
          h2: (props) => (
            <h2 className="text-base sm:text-lg font-bold mt-3.5 mb-2 text-slate-900" {...withoutNode(props)} />
          ),
          h3: (props) => (
            <h3 className="text-sm sm:text-base font-semibold mt-3 mb-1.5 text-slate-850" {...withoutNode(props)} />
          ),
          h4: (props) => (
            <h4 className="text-xs sm:text-sm font-semibold mt-2.5 mb-1 text-slate-800" {...withoutNode(props)} />
          ),
          p: (props) => <p className="mb-2 leading-relaxed text-slate-800" {...withoutNode(props)} />,
          a: (props) => (
            <a
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium break-all"
              target="_blank"
              rel="noopener noreferrer"
              {...withoutNode(props)}
            />
          ),
          ul: (props) => (
            <ul className="list-disc list-outside ml-4 sm:ml-5 mb-2 space-y-1 text-slate-800" {...withoutNode(props)} />
          ),
          ol: (props) => (
            <ol className="list-decimal list-outside ml-4 sm:ml-5 mb-2 space-y-1 text-slate-800" {...withoutNode(props)} />
          ),
          li: (props) => <li className="mb-0.5 leading-relaxed" {...withoutNode(props)} />,
          strong: (props) => <strong className="font-semibold text-slate-950" {...withoutNode(props)} />,
          em: (props) => <em className="italic" {...withoutNode(props)} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-slate-800/50 p-3 rounded-r-xl italic text-slate-700 my-3 text-xs sm:text-sm"
              {...withoutNode(props)}
            />
          ),
          table: (props) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse" {...withoutNode(props)} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-900 font-bold" {...withoutNode(props)} />
          ),
          tbody: (props) => <tbody className="divide-y divide-slate-100 bg-white" {...withoutNode(props)} />,
          tr: (props) => <tr className="hover:bg-slate-50/60 transition-colors" {...withoutNode(props)} />,
          th: (props) => (
            <th className="px-3.5 py-2.5 font-bold text-slate-900 text-xs sm:text-sm" {...withoutNode(props)} />
          ),
          td: (props) => (
            <td className="px-3.5 py-2.5 text-slate-700 text-xs sm:text-sm" {...withoutNode(props)} />
          ),
          hr: (props) => <hr className="my-4 border-slate-200" {...withoutNode(props)} />,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code
                  className="bg-slate-100 text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs font-semibold"
                  {...withoutNode(props)}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : ''} code={codeString} />;
          },
          pre: (props) => <div {...withoutNode(props)} /> // CodeBlock component handles pre wrapper
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
