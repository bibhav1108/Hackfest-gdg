import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { AudioTranscriberButton } from '../voice/AudioTranscriberButton';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface GeminiPharmacistChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GeminiPharmacistChatModal: React.FC<GeminiPharmacistChatModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaste! I am your Jan Aushadhi Clinical Pharmacist Advisor. How can I assist you with generic medicine equivalents, active salts, dosage, or savings today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInputText(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const userQuery = (textToSend || inputText).trim();
    if (!userQuery || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          history: historyPayload,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      const botMessage: Message = {
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        text: 'I apologize, but I could not reach the clinical database right now. Please verify your query or consult your local Jan Aushadhi pharmacist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const samplePrompts = [
    'Is Jan Aushadhi Pan 40 identical to Pantocid 40?',
    'What are the side effects of Amoxicillin & Clavulanate?',
    'How do Jan Aushadhi medicines stay 80% cheaper?',
    'Can I switch my blood pressure tablet to generic?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl h-[88vh] flex flex-col rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4 bg-teal-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  Jan Aushadhi AI Clinical Advisor
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold">
                  Multi-Turn Chat
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask about generic drug equivalence, bioequivalence, and precautions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 text-teal-900 dark:text-teal-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none shadow-2xs pr-7 appearance-none cursor-pointer"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-line font-medium">
                  {msg.text}
                </div>

                <div className={`flex items-center justify-between text-[10px] pt-1 ${
                  msg.role === 'user' ? 'text-teal-100' : 'text-slate-400 dark:text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Consulting pharmacopeia and clinical guidelines with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] text-slate-400 font-bold shrink-0">Suggestions:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-900 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition shrink-0 border border-slate-200/60 dark:border-slate-700"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Audio transcription mic button powered by gemini-3.5-transcribe */}
            <AudioTranscriberButton
              onTranscribed={(spokenText) => {
                setInputText((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
              }}
            />

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about generic medicines, active salts, or side effects..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex items-center justify-center p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-md transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
