import React, { useState, useEffect, useRef } from 'react';
import { Radio, Mic, MicOff, Volume2, X, AlertCircle, Sparkles, Activity } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing Live Session...');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(false);
  const nextPlayTimeRef = useRef<number>(0);

  isMutedRef.current = isMuted;

  // Helper: Float32Array to 16-bit PCM base64 string
  const pcmToBase64 = (inputData: Float32Array): string => {
    const buffer = new ArrayBuffer(inputData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Play 24kHz PCM chunk seamlessly
  const playAudioChunk = (audioCtx: AudioContext, base64PCM: string) => {
    try {
      const binary = atob(base64PCM);
      const len = binary.length / 2;
      const buffer = audioCtx.createBuffer(1, len, 24000);
      const channelData = buffer.getChannelData(0);

      const dataView = new DataView(new ArrayBuffer(binary.length));
      for (let i = 0; i < binary.length; i++) {
        dataView.setUint8(i, binary.charCodeAt(i));
      }

      for (let i = 0; i < len; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        channelData[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
      setIsTalking(true);

      source.onended = () => {
        if (audioCtx.currentTime >= nextPlayTimeRef.current) {
          setIsTalking(false);
        }
      };
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const startSession = async () => {
    setError(null);
    setStatusMessage('Connecting to Gemini 3.8 Live API...');

    try {
      // 1. Establish WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 2. Audio Contexts: 16kHz for input mic, 24kHz for output playback
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      // 3. Capture Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const inputChannel = e.inputBuffer.getChannelData(0);
          const base64PCM = pcmToBase64(inputChannel);
          ws.send(JSON.stringify({ audio: base64PCM }));
        }
      };

      ws.onopen = () => {
        setIsConnected(true);
        setStatusMessage('Live Session Active. Speak naturally to Gemini...');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio && outputAudioCtxRef.current) {
            playAudioChunk(outputAudioCtxRef.current, msg.audio);
          }
          if (msg.interrupted) {
            // Stop current playback
            nextPlayTimeRef.current = 0;
            setIsTalking(false);
          }
          if (msg.error) {
            setError(msg.error);
          }
        } catch (e) {
          console.error('Error handling live message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Live API error:', e);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusMessage('Live Session Ended');
      };
    } catch (err: any) {
      console.error('Failed to start Live API session:', err);
      setError(err.message || 'Microphone access or WebSocket connection failed');
      cleanup();
    }
  };

  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622]">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />
            <h3 className="font-semibold text-white tracking-wide text-sm">
              Gemini 3.8 Live API Voice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Central Pulsing Sphere / Visualizer */}
          <div className="relative flex items-center justify-center py-6">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isTalking
                  ? 'bg-gradient-to-tr from-teal-500 to-sky-400 shadow-[0_0_40px_rgba(45,212,191,0.6)] scale-110'
                  : isConnected
                  ? 'bg-[#152a3d] border-2 border-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
                  : 'bg-slate-800 border border-slate-700 opacity-60'
              }`}
            >
              {isTalking ? (
                <Volume2 className="w-12 h-12 text-slate-950 animate-bounce" />
              ) : (
                <Mic className="w-12 h-12 text-teal-300" />
              )}
            </div>

            {/* Ripple rings */}
            {isTalking && (
              <span className="absolute w-44 h-44 rounded-full border border-teal-400/40 animate-ping pointer-events-none" />
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold text-white">
              {isTalking ? 'Gemini is Speaking...' : isConnected ? 'Listening to Pharmacist...' : 'Connecting...'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {statusMessage}
            </p>
          </div>

          {/* Audio waveform simulator bars */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            {[20, 50, 80, 40, 90, 60, 30, 75, 45, 65, 35].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isTalking || isConnected ? `${(h * (isTalking ? 1 : 0.4))}px` : '4px',
                }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isTalking ? 'bg-teal-400' : isConnected ? 'bg-teal-600/60' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-[#122334] border-[#1b344d] text-slate-300 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              End Call
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-3 bg-[#0a1622] text-[11px] text-slate-400">
          Real-time low latency duplex audio powered by <strong className="text-teal-300">gemini-3.8-live</strong>
        </div>
      </div>
    </div>
  );
};
