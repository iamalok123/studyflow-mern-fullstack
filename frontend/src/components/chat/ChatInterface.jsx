import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
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
  }, [documentId])

  useEffect(() => {
    scrollToBottom();
  }, [history]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };
      setHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error: ", error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div key={index} className={`flex items-start ${isUser ? 'justify-end' : ''} gap-3 my-4`}>
        {!isUser && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2} />
          </div>
        )}

        <div className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm shadow-sm ${isUser
          ? 'bg-emerald-500 text-white rounded-tr-none'
          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
          }`}>
          <MarkdownRenderer content={msg.content} />
          <p className={`text-[10px] sm:text-xs mt-1 ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isUser && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-slate-400 to-slate-600 flex items-center justify-center shrink-0 text-white font-semibold text-xs">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden justify-center items-center gap-3">
        <div className='h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center'>
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className='text-slate-500 font-medium text-sm'>Loading Chat History...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden">
      {/* Message Area */}
      <div className='flex-1 w-full min-h-0 px-3 py-4 sm:p-6 overflow-y-auto bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50'>
        {history.length === 0 ? (
          <div className='flex flex-col h-full text-center justify-center items-center gap-2 px-4'>
            <div className='h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20'>
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className='text-sm sm:text-base font-semibold text-slate-900'>Start a Conversation</h3>
            <p className='text-slate-500 text-xs sm:text-sm max-w-xs sm:max-w-md'>Ask me anything about your document. I'm here to help you!</p>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        <div ref={messageEndRef} />

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Spinner inline className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '100ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className='w-full px-3 py-3 sm:px-5 sm:py-4 bg-white/90 border-t border-slate-200/60 shrink-0'>
        <form onSubmit={handleSendMessage} className='flex items-center gap-2 sm:gap-3'>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3 sm:px-4 h-10 sm:h-12 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;