import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const withoutNode = (props) => {
  const nextProps = { ...props };
  delete nextProps.node;
  return nextProps;
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-slate-700 ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-800" {...withoutNode(props)} />,
          h2: (props) => <h2 className="text-lg font-bold mt-4 mb-2 text-slate-800" {...withoutNode(props)} />,
          h3: (props) => <h3 className="text-md font-semibold mt-3 mb-2 text-slate-800" {...withoutNode(props)} />,
          h4: (props) => <h4 className="text-sm font-semibold mt-3 mb-1 text-slate-700" {...withoutNode(props)} />,
          p: (props) => <p className="mb-2 leading-relaxed" {...withoutNode(props)} />,
          a: (props) => <a className="text-emerald-600 hover:text-emerald-700 hover:underline" target="_blank" rel="noopener noreferrer" {...withoutNode(props)} />,
          ul: (props) => <ul className="list-disc list-outside ml-5 mb-2 space-y-1" {...withoutNode(props)} />,
          ol: (props) => <ol className="list-decimal list-outside ml-5 mb-2 space-y-1" {...withoutNode(props)} />,
          li: (props) => <li className="mb-1 leading-relaxed" {...withoutNode(props)} />,
          strong: (props) => <strong className="font-semibold" {...withoutNode(props)} />,
          em: (props) => <em className="italic" {...withoutNode(props)} />,
          blockquote: (props) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...withoutNode(props)} />,
          code: ({ className, children, ...props }) => {
            const isInline = !String(children).includes('\n');
            const safeProps = withoutNode(props);
            return isInline ? (
              <code className="bg-slate-100 p-1 rounded font-mono text-sm" {...safeProps}>
                {children}
              </code>
            ) : (
              <code className={`block whitespace-pre overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100 ${className || ''}`} {...safeProps}>
                {children}
              </code>
            );
          },
          pre: (props) => <pre className='bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto font-mono text-sm my-4' {...withoutNode(props)} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
