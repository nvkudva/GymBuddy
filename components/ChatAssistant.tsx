import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, WorkoutPlan, DayPlan } from '../types';
import { createChatSession } from '../services/geminiService';
import { GlassCard, GlassInput } from './ui/GlassCard';
import { MessageSquare, Send, X, Bot, User, Minimize2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
      // Correct API usage: pass an object with 'message' property
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      // Correct API usage: functionCalls is a property, not a method
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

      // Correct API usage: text is a property, not a method
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full shadow-lg hover:shadow-pink-500/40 transition-all hover:scale-110 z-50 text-white"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <GlassCard className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] z-50 flex flex-col overflow-hidden border-white/30 shadow-2xl">
      {/* Header */}
      <div className="bg-white/10 p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Aura</h3>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
            </span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
            <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : msg.role === 'system'
                ? 'bg-green-500/20 border border-green-500/30 text-green-200 w-full text-center italic'
                : 'bg-white/10 text-white border border-white/10 rounded-tl-none backdrop-blur-md'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/20 border-t border-white/10">
        <div className="relative">
          <GlassInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about diet, form, or change plan..."
            className="pr-12"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default ChatAssistant;