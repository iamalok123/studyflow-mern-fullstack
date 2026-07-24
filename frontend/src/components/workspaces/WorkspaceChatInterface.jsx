import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Layers } from 'lucide-react';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import MarkdownRenderer from '../common/MarkdownRenderer';

const WorkspaceChatInterface = ({ workspaceId, workspaceTitle }) => {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messageEndRef = useRef();

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!workspaceId) return;
      try {
        setInitialLoading(true);
        const messages = await aiService.getWorkspaceChatHistory(workspaceId);
        setHistory(messages || []);
      } catch (error) {
        console.error('Failed to load workspace chat history: ', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, [workspaceId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setHistory(prev => [...prev, userMessage]);
    const currentQuestion = message;
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.workspaceChat(workspaceId, currentQuestion);
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Workspace chat failed:', error);
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ Error: ${error.error || error.message || 'Failed to generate response. Ensure documents in this workspace are processed and ready.'}`,
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-162.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Chat Sub-header */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Workspace Multi-Doc Assistant</h3>
            <p className="text-[11px] text-slate-500">
              Asking across all documents in "{workspaceTitle || 'Workspace'}"
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Ask Anything Across Workspace PDFs
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemini will search and synthesize information from all documents added to this workspace.
            </p>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
              <Spinner size="sm" />
              <span>Synthesizing answer across workspace PDFs...</span>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            placeholder="Ask a question across all workspace documents..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-emerald-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceChatInterface;
