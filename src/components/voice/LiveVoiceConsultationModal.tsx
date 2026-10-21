import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Radio, 
  Volume2, 
  AlertCircle, 
  Loader2, 
  PhoneOff
} from 'lucide-react';

interface LiveVoiceConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMedicine?: string;
}

export const LiveVoiceConsultationModal: React.FC<LiveVoiceConsultationModalProps> = ({
  isOpen,
  onClose,
  activeMedicine,
}) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error' | 'disconnected'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    startConsultation();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setStatus('disconnected');
  };

  const startConsultation = async () => {
    setStatus('connecting');
    setErrorMessage(null);

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = async () => {
        setStatus('listening');
        // Send initial context if active medicine exists
        if (activeMedicine) {
          ws.send(JSON.stringify({
            text: `Patient is viewing generic medicine comparison for: ${activeMedicine}. Greet them and explain the chemical salt equivalence.`
          }));
        }
        await startAudioRecording(ws);
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            setStatus('speaking');
            playAudioChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            // Cancel current playback
            nextPlayTimeRef.current = 0;
            setStatus('listening');
          }
        } catch (e) {
          console.error('Error parsing live WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        setStatus('error');
        setErrorMessage('Unable to connect to live audio server. Please check microphone permissions or try again.');
      };

      ws.onclose = () => {
        setStatus('disconnected');
      };
    } catch (err: any) {
      console.error('Failed to init live audio:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Microphone or WebSocket initialization failed');
    }
  };

  // Capture audio from microphone (16kHz PCM) and send over WebSocket
  const startAudioRecording = async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to 16-bit PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert PCM buffer to base64
        const uint8 = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64Audio = btoa(binary);

        ws.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    } catch (micErr: any) {
      console.error('Microphone stream error:', micErr);
      setErrorMessage('Microphone access was denied or is not supported.');
      setStatus('error');
    }
  };

  // Play audio chunk from server (PCM 16-bit 24kHz / 16kHz)
  const playAudioChunk = (base64Data: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      source.onended = () => {
        if (ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
          setStatus('listening');
        }
      };
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md flex flex-col rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-teal-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-sm">
                  Live Voice Clinical Consultation
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.2 text-[9px] font-bold">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Spoken bi-directional consultation with an AI Clinical Pharmacist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visualizer & Orb Area */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
          
          {/* Animated Glowing Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer rings */}
            <div className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
              status === 'speaking'
                ? 'bg-emerald-400/30 dark:bg-emerald-500/20 scale-125 animate-ping'
                : status === 'listening'
                ? 'bg-teal-400/20 dark:bg-teal-500/20 scale-110 animate-pulse'
                : 'bg-slate-200/40 dark:bg-slate-800/40 scale-100'
            }`} />

            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
              status === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white scale-105'
                : status === 'listening'
                ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {status === 'speaking' ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : status === 'listening' ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : status === 'connecting' ? (
                <Loader2 className="w-10 h-10 animate-spin text-teal-600 dark:text-teal-400" />
              ) : (
                <Radio className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              status === 'speaking'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : status === 'listening'
                ? 'bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-800'
                : status === 'connecting'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                status === 'speaking' ? 'bg-emerald-600 animate-ping' :
                status === 'listening' ? 'bg-teal-600 animate-pulse' :
                'bg-amber-600'
              }`} />
              {status === 'speaking' && 'Pharmacist is Speaking...'}
              {status === 'listening' && 'Listening to your voice... Speak now'}
              {status === 'connecting' && 'Connecting to Live API...'}
              {status === 'error' && 'Connection Error'}
              {status === 'disconnected' && 'Session Ended'}
            </span>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {activeMedicine
                ? `Ask about dosages, side effects, bioequivalence, or food interactions for ${activeMedicine}.`
                : 'Speak naturally to ask about generic medicines, PMBJP equivalents, or prescription safety.'}
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Suggested Spoken Phrases */}
          <div className="w-full text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
              Try asking out loud:
            </span>
            <div className="space-y-1 text-[11px]">
              <p className="cursor-pointer hover:text-teal-700 dark:hover:text-teal-300">"Is Jan Aushadhi Augmentin identical to the branded version?"</p>
              <p className="cursor-pointer hover:text-teal-700 dark:hover:text-teal-300">"What is the recommended dose and should I take it with food?"</p>
              <p className="cursor-pointer hover:text-teal-700 dark:hover:text-teal-300">"Are there any common interactions with antacids?"</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              isMuted
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-rose-600 dark:text-rose-400" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
            <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
