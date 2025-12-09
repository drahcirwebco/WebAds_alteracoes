
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, type ChatMessage } from '../services/geminiService';
import type { Campaign } from '../types';

declare var marked: {
  parse(markdown: string): string;
};

interface ChatBotProps {
  campaignData: Campaign[];
}

// --- Icons ---

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg>
);

// Skill Icons
const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface Skill {
    label: string;
    query: string;
    icon: React.ReactNode;
}

const SKILLS: Skill[] = [
  { label: "Otimizar Campanhas", query: "Qual campanha devo priorizar a otimização hoje?", icon: <WrenchIcon /> },
  { label: "Análise de CPA", query: "Como está o meu CPA em relação à média? Está caro?", icon: <DollarIcon /> },
  { label: "Resumo Geral", query: "Faça um resumo executivo da performance geral.", icon: <ChartBarIcon /> },
  { label: "Escalar Resultados", query: "Quais campanhas têm potencial para escalar (aumentar verba)?", icon: <TrendingUpIcon /> },
  { label: "Campanhas Ruins", query: "Identifique as campanhas com pior desempenho.", icon: <TrendingDownIcon /> },
];

export const ChatBot: React.FC<ChatBotProps> = ({ campaignData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: 'Olá! Sou seu Consultor de Tráfego e Growth. Como posso te ajudar hoje?' }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Add user message to UI
    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', parts: [{ text: textToSend }] }
    ];
    setMessages(newHistory);

    try {
      // Pass the history and the current campaign data context to the service
      const responseText = await sendChatMessage(textToSend, messages, campaignData);

      setMessages(prev => [
        ...prev,
        { role: 'model', parts: [{ text: responseText }] }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: 'model', parts: [{ text: "Desculpe, ocorreu um erro ao processar sua mensagem." }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window with Glassmorphism */}
      <div 
        className={`fixed bottom-24 right-6 w-full max-w-[350px] sm:max-w-[400px] 
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl backdrop-saturate-150
          rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 
          flex flex-col transition-all duration-300 transform origin-bottom-right z-50 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '600px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-primary-light/90 dark:bg-primary-dark/90 backdrop-blur-md p-4 rounded-t-2xl flex justify-between items-center border-b border-white/10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold">Consultor de Growth</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-700/50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-light dark:bg-primary-dark text-white rounded-br-none' 
                    : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-text-primary-light dark:text-text-primary-dark rounded-bl-none border border-white/30 dark:border-slate-700/50'
                }`}
              >
                {msg.role === 'model' ? (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.parts[0].text) }} 
                  />
                ) : (
                  msg.parts[0].text
                )}
              </div>
            </div>
          ))}

          {/* Skills Grid (Only shown when there is only the initial greeting) */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-4">
                <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3 ml-1 uppercase tracking-wider">Sugestões de Análise</p>
                <div className="grid grid-cols-2 gap-3">
                    {SKILLS.map((skill, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(skill.query)}
                            className={`flex flex-col items-start p-3 rounded-xl transition-all duration-200 border
                             bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60
                             border-white/30 dark:border-slate-600/30 hover:border-primary-light/50 dark:hover:border-primary-dark/50
                             group text-left ${idx === SKILLS.length - 1 ? 'col-span-2' : ''}`} // Make the last item span full width if odd
                        >
                            <div className="mb-2 p-2 rounded-lg bg-white/50 dark:bg-slate-700/50 text-primary-light dark:text-primary-dark group-hover:scale-110 transition-transform">
                                {skill.icon}
                            </div>
                            <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {skill.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/30 dark:border-slate-700/50 rounded-2xl rounded-bl-none p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white/40 dark:bg-black/20 backdrop-blur-md border-t border-white/20 dark:border-slate-700/30 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-white/50 dark:bg-slate-800/50 text-text-primary-light dark:text-text-primary-dark border border-white/20 dark:border-slate-700/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-primary-light hover:bg-indigo-700 dark:bg-primary-dark dark:hover:bg-indigo-500 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 focus:outline-none focus:ring-4 focus:ring-primary-light/30 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white rotate-90' 
            : 'bg-primary-light hover:bg-indigo-700 dark:bg-primary-dark dark:hover:bg-indigo-500 text-white'
        }`}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
};
