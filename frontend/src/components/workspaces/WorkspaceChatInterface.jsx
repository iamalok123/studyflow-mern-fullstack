import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Layers } from 'lucide-react';
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

    const userQuestion = message.trim();
    const userMessage = { role: 'user', content: userQuestion, timestamp: new Date() };

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, userMessage, assistantPlaceholder]);
    setMessage('');
    setLoading(true);

    try {
      await aiService.streamWorkspaceChat(
        workspaceId,
        userQuestion,
        (chunkText) => {
          setHistory(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + chunkText,
              };
            }
            return updated;
          });
        }
      );
    } catch (error) {
      console.error('Workspace streaming chat failed:', error);
      setHistory(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content || `⚠️ Error: ${error.message || 'Failed to stream response. Ensure workspace documents are processed.'}`,
          };
        }
        return updated;
      });
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
    <div className="flex flex-col h-162.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full max-w-full min-w-0">
      {/* Chat Sub-header */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 truncate">Workspace Multi-Doc Assistant</h3>
            <p className="text-[11px] text-slate-500 truncate">
              Asking across all documents in "{workspaceTitle || 'Workspace'}"
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-5 bg-[#EEF6F2]/30 min-w-0">
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
              className={`flex gap-3 max-w-[90%] sm:max-w-[85%] min-w-0 ${
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
                {msg.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs min-w-0 max-w-full overflow-hidden wrap-break-word ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                }`}
              >
                <div className={msg.role === 'user' ? '**:text-white! [&_a]:text-white! [&_code]:bg-white/10! [&_code]:text-white!' : ''}>
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <div className="flex items-center gap-1.5 py-1 text-xs text-slate-400 font-medium">
                      <Spinner inline size="sm" />
                      <span>Synthesizing real-time response across workspace PDFs...</span>
                    </div>
                  )}
                </div>
                {msg.timestamp && (
                  <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200/80">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question across workspace documents..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceChatInterface;
