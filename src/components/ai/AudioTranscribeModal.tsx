import React from 'react';
import { Mic, MicOff, Loader2, Copy, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { useAudioTranscription } from '../../hooks/useAudioTranscription';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText?: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
}) => {
  const {
    isRecording,
    isTranscribing,
    transcription,
    error,
    startRecording,
    stopRecording,
    setTranscription,
  } = useAudioTranscription();

  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (transcription && onApplyText) {
      onApplyText(transcription);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white tracking-wide text-sm">
                  Clinical Audio Transcription
                </h3>
                <span className="rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.2 text-[10px] font-mono-numbers">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dictate prescription directions, patient notes, or drug queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Recording Control Button & Wave */}
          <div className="flex flex-col items-center justify-center py-6 rounded-xl border border-[#1b344d] bg-[#0b1622]">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-105 shadow-teal-500/30'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8 stroke-[2.2]" />
              )}
            </button>

            <span className="mt-4 text-xs font-medium text-slate-300">
              {isRecording
                ? 'Listening... Click to stop & transcribe'
                : isTranscribing
                ? 'Transcribing audio with Gemini 3.5...'
                : 'Click microphone to begin dictating'}
            </span>

            {isRecording && (
              <div className="mt-3 flex items-center gap-1">
                {[40, 70, 30, 90, 60, 80, 50, 85, 35].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h * 0.3}px` }}
                    className="w-1 bg-rose-400 rounded-full animate-bounce"
                  />
                ))}
              </div>
            )}

            {isTranscribing && (
              <div className="mt-3 flex items-center gap-2 text-teal-300 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing high-precision medical transcript...</span>
              </div>
            )}
          </div>

          {/* Result Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Transcribed Output:</span>
              {transcription && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Your transcribed text will appear here automatically..."
              className="w-full rounded-xl bg-[#142637] border border-[#203a54] p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b344d] p-4 bg-[#0a1622] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by Google Gemini 3.5 Transcribe
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:bg-[#142637] rounded-lg transition"
            >
              Cancel
            </button>
            {onApplyText && (
              <button
                disabled={!transcription}
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-semibold text-xs shadow-md transition"
              >
                Apply Transcribed Text
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
