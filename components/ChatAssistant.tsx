import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, WorkoutPlan, DayPlan } from '../types';
import { createChatSession } from '../services/geminiService';
import { GlassCard, GlassInput } from './ui/GlassCard';
import { MessageSquare, Send, Bot, Minimize2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatAssistantProps {
  currentPlan: WorkoutPlan;
  onPlanUpdate: (newPlan: WorkoutPlan) => void;
  profileName: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentPlan, onPlanUpdate, profileName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${profileName}! I'm Aura, your AI trainer. How's the workout going today? Need any tips or adjustments?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession(currentPlan);
    }
  }, [isOpen, currentPlan]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'updateWorkoutPlan') {
            const args = call.args as any;
            const newRoutineRaw = args.newWeeklyRoutine;
            
            // Hydrate with IDs
             const hydratedData: DayPlan[] = newRoutineRaw.map((day: any) => ({
              ...day,
              exercises: day.exercises.map((ex: any) => ({
                ...ex,
                id: uuidv4(),
                isCompleted: false
              }))
            }));

            onPlanUpdate({ weeklyRoutine: hydratedData });
            
            // Send confirmation back to model
            setMessages(prev => [...prev, { 
              id: uuidv4(), 
              role: 'system', 
              text: `⚡ Plan Updated: ${args.changesDescription}` 
            }]);
          }
        }
      }

      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text }]);
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: "I'm having trouble connecting to the gym server right now. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full shadow-lg hover:shadow-pink-500/40 transition-all hover:scale-110 z-50 text-white group"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
      </button>
    );
  }

  return (
    <GlassCard className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] z-50 flex flex-col overflow-hidden border-purple-200 dark:border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 flex items-center justify-between border-b border-purple-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white dark:ring-white/10">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Aura Trainer</h3>
            <span className="text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-white/10 text-purple-400 dark:text-purple-300 transition-colors">
            <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-white/20">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none shadow-purple-500/20' 
                : msg.role === 'system'
                ? 'bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-300 w-full text-center text-xs font-medium tracking-wide uppercase py-2'
                : 'bg-white dark:bg-white/10 text-gray-800 dark:text-white border border-purple-100 dark:border-white/10 rounded-tl-none'}
            `}>
              <div className={`
                  prose prose-sm max-w-none
                  ${msg.role === 'user' ? 'prose-invert text-white' : 'dark:prose-invert text-gray-800 dark:text-gray-100'}
                  prose-p:my-1 prose-p:leading-relaxed
                  prose-headings:font-bold prose-headings:text-inherit
                  prose-strong:font-bold prose-strong:text-inherit
                  prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4
                  prose-ol:my-1 prose-ol:list-decimal prose-ol:pl-4
                  prose-li:my-0.5
                  prose-blockquote:border-l-2 prose-blockquote:border-current prose-blockquote:pl-2 prose-blockquote:italic prose-blockquote:my-2
                  prose-a:underline prose-a:text-inherit
                `}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-white/10 border border-purple-100 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-4 flex gap-1.5 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-black/20 border-t border-purple-100 dark:border-white/10">
        <div className="relative group">
          <GlassInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="pr-12 border-purple-100 dark:border-white/10 focus:ring-purple-400/50"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/40 disabled:opacity-50 transition-all disabled:bg-transparent"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default ChatAssistant;