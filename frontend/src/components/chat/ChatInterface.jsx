import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/useAuth';
import Spinner from '../common/Spinner';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
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
      try {
        setInitialLoading(true);
        const messages = await aiService.getChatHistory(documentId);
        setHistory(messages || []);
      } catch (error) {
        console.error('Failed to load chat history: ', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userQuestion = message.trim();
    const userMessage = { role: 'user', content: userQuestion, timestamp: new Date() };
    
    // Create streaming assistant placeholder message
    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, userMessage, assistantPlaceholder]);
    setMessage('');
    setLoading(true);

    try {
      await aiService.streamChat(
        documentId,
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
      console.error('Streaming Chat Error: ', error);
      setHistory(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content || '⚠️ Sorry, I encountered an error streaming the response. Please try again.',
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-3 max-w-[92%] sm:max-w-[85%] min-w-0 ${
          isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
            isUser
              ? 'bg-slate-900 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {isUser ? (user?.username?.charAt(0)?.toUpperCase() || 'U') : <Sparkles className="w-4 h-4" />}
        </div>

        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs min-w-0 max-w-full overflow-hidden wrap-break-word ${
            isUser
              ? 'bg-slate-900 text-white rounded-tr-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}
        >
          <div className={isUser ? '**:text-white! [&_a]:text-white! [&_code]:bg-white/10! [&_code]:text-white!' : ''}>
            {msg.content ? (
              <MarkdownRenderer content={msg.content} />
            ) : (
              <div className="flex items-center gap-1.5 py-1 text-xs text-slate-400 font-medium">
                <Spinner inline size="sm" />
                <span>Generating real-time response...</span>
              </div>
            )}
          </div>
          {msg.timestamp && (
            <p className={`text-[10px] sm:text-xs mt-1.5 ${isUser ? 'text-slate-300' : 'text-slate-400'}`}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] app-panel overflow-hidden justify-center items-center gap-3">
        <div className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm flex items-center justify-center">
          <MessageSquare className="w-7 h-7" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-slate-500 font-medium text-sm">Loading Chat History...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Sub-header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 truncate">Document AI Assistant</h3>
            <p className="text-[11px] text-slate-500 truncate">
              Ask questions grounded directly in your uploaded document
            </p>
          </div>
        </div>
      </div>

      {/* Message Scroll Area */}
      <div className="flex-1 w-full min-h-0 px-3 py-4 sm:p-6 overflow-y-auto bg-[#EEF6F2]/30 min-w-0 space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col h-full text-center justify-center items-center gap-2 px-4 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-xs">
              <Sparkles className="w-7 h-7" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Start a Conversation</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Ask me anything about your document. I will explain concepts, syntax, and examples!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Form Area */}
      <div className="w-full px-3 py-3 sm:px-5 sm:py-3.5 bg-white border-t border-slate-200/80 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
