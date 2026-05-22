import React, { useState, useEffect, useRef } from 'react'
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
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" strokeWidth={2} />
          </div>
        )}

        <div className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm shadow-sm ${isUser
          ? 'bg-slate-950 text-white rounded-tr-none'
          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}>
          <div className={isUser ? '[&_*]:!text-white [&_a]:!text-white [&_code]:!bg-white/10 [&_code]:!text-white' : ''}>
            <MarkdownRenderer content={msg.content} />
          </div>
          <p className={`text-[10px] sm:text-xs mt-1 ${isUser ? 'text-slate-300' : 'text-slate-400'}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isUser && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 text-white font-semibold text-xs shadow-sm shadow-slate-950/15">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] app-panel overflow-hidden justify-center items-center gap-3">
        <div className='h-14 w-14 rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm flex items-center justify-center'>
          <MessageSquare className="w-7 h-7" strokeWidth={2} />
        </div>
        <Spinner />
        <p className='text-slate-500 font-medium text-sm'>Loading Chat History...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-[60vh] sm:h-[70vh] app-panel overflow-hidden">
      {/* Message Area */}
      <div className='flex-1 w-full min-h-0 px-3 py-4 sm:p-6 overflow-y-auto bg-[#EEF6F2]/55'>
        {history.length === 0 ? (
          <div className='flex flex-col h-full text-center justify-center items-center gap-2 px-4'>
            <div className='h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm flex items-center justify-center mb-2'>
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0">
              <Spinner inline className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce" style={{ animationDelay: '100ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce" style={{ animationDelay: '200ms' }}></span>
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
            className="app-input flex-1 h-10 sm:h-12 rounded-xl px-3 sm:px-4"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white transition-all duration-200 shadow-md shadow-slate-950/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
