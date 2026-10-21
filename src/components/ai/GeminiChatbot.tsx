import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  Settings2, 
  RotateCcw, 
  Cpu, 
  ShieldAlert, 
  Pill, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ isOpen, onClose }) => {
  // Available models based on user requirements
  const models = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      tag: 'General Tasks',
      description: 'Balanced clinical reasoning and dispensary assistance',
    },
    {
      id: 'gemini-4-argon',
      name: 'Gemini 4 Argon',
      tag: 'Complex Tasks',
      description: 'Advanced pharmacology, polypharmacy & rare drug interactions',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      tag: 'Fast Responses',
      description: 'Rapid dosages, abbreviations & metric calculations',
    },
  ];

  const rolePresets = [
    {
      label: 'Clinical Pharmacist',
      instruction: 'You are Apotheca Senior Clinical Pharmacist. Advise on drug dosages, administration timing, therapeutic equivalence, and patient counseling notes with medical rigor.',
    },
    {
      label: 'Drug Interaction Auditor',
      instruction: 'You are an expert Clinical Pharmacologist. Strictly audit drug-drug interactions, CYP450 enzyme conflicts, contraindications, and adverse risks for given medication lists.',
    },
    {
      label: 'Fast Dosage Calculator',
      instruction: 'You are a rapid Pediatric and Renal Dosage Calculator. Provide quick, accurate formulas, mg/kg conversions, and creatinine clearance dosage adjustments.',
    },
  ];

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState(rolePresets[0]);
  const [showConfig, setShowConfig] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Greetings. I am your Apotheca Clinical Pharmacy Assistant. You can consult me on pharmacology regimens, drug-drug interactions, pediatric dose adjustments, or pharmaceutical guidelines.',
      timestamp: 'Just now',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      // Map history for Gemini API
      const apiMessages = updatedHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          text: m.text,
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          systemInstruction: selectedRole.instruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `Error: ${err.message || 'Unable to connect to Gemini'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl h-[640px] max-h-[92vh] flex flex-col rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-5 py-3.5 bg-[#0a1622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white tracking-wide text-sm">
                  Clinical Pharmacy Chatbot
                </h3>
                <span className="rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono-numbers">
                  {selectedModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Role: {selectedRole.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded-lg border transition ${
                showConfig
                  ? 'border-teal-500/50 bg-teal-500/20 text-teal-300'
                  : 'border-[#1b344d] text-slate-400 hover:text-slate-200 hover:bg-[#142637]'
              }`}
              title="Configure Role & Model"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    role: 'model',
                    text: 'Greetings. How can I assist with your clinical cases or dispensary today?',
                    timestamp: 'Just now',
                    modelUsed: selectedModel,
                  },
                ]);
              }}
              className="p-1.5 rounded-lg border border-[#1b344d] text-slate-400 hover:text-slate-200 hover:bg-[#142637] transition"
              title="Reset Chat History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Configuration Drawer */}
        {showConfig && (
          <div className="p-4 border-b border-[#1b344d] bg-[#0c1825] space-y-3 shrink-0 animate-in slide-in-from-top-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 block mb-1.5">
                Gemini Model Selection:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2 rounded-xl text-left border transition ${
                      selectedModel === m.id
                        ? 'border-teal-500/60 bg-teal-500/15 text-white'
                        : 'border-[#1b344d] bg-[#112334] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{m.name}</span>
                      <span className="text-[9px] px-1 rounded bg-[#0a1622] text-teal-300 font-mono-numbers">
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {m.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 block mb-1.5">
                System Instruction & Role Persona:
              </label>
              <div className="flex gap-2">
                {rolePresets.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selectedRole.label === r.label
                        ? 'border-teal-500/50 bg-teal-500/20 text-teal-200'
                        : 'border-[#1b344d] bg-[#112334] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-slate-950 font-medium rounded-tr-xs shadow-md'
                      : 'bg-[#122437] border border-[#1d3852] text-slate-200 rounded-tl-xs shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div className={`mt-1.5 flex items-center gap-2 text-[10px] ${isUser ? 'text-teal-900 justify-end' : 'text-slate-500'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && !isUser && (
                      <span className="font-mono-numbers text-teal-400/80">({msg.modelUsed})</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl bg-[#122437] border border-[#1d3852] px-4 py-3 text-xs text-teal-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating pharmacology guidance with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#1b344d] bg-[#0a1622] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${selectedRole.label} about drug interactions, dosages, guidelines...`}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#142637] border border-[#203a54] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 transition shadow-sm"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
};
