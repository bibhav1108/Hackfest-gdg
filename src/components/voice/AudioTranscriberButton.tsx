import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';

interface AudioTranscriberButtonProps {
  onTranscribed: (text: string) => void;
  className?: string;
  buttonText?: string;
}

const MAX_RECORDING_MS = 15_000;

function getSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    .find((type) => MediaRecorder.isTypeSupported(type));
}

export const AudioTranscriberButton: React.FC<AudioTranscriberButtonProps> = ({
  onTranscribed,
  className = '',
  buttonText,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timerRef.current = null;
    timeoutRef.current = null;
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      stopTracks();
    };
  }, []);

  const sendToTranscribe = async (blob: Blob) => {
    if (!blob.size) {
      setError('No audio was captured. Try again and speak close to the microphone.');
      return;
    }
    setIsTranscribing(true);
    setError('');
    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the recorded audio.'));
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.readAsDataURL(blob);
      });
      const response = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData: base64Audio, mimeType: blob.type || 'audio/webm' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Transcription failed. Please try again.');
      const text = typeof data.text === 'string' ? data.text.trim() : '';
      if (!text) throw new Error('No speech was recognised. Try speaking clearly and again.');
      if (mountedRef.current) onTranscribed(text);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Could not transcribe audio. Please try again.');
    } finally {
      if (mountedRef.current) setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setError('');
    setRecordingSeconds(0);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice search is not supported in this browser. Please type the medicine name.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        clearTimers();
        stopTracks();
        setIsRecording(false);
        setError('Recording failed. Check microphone access and try again.');
      };
      recorder.onstop = () => {
        clearTimers();
        stopTracks();
        setIsRecording(false);
        void sendToTranscribe(new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' }));
      };
      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
      timeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      stopTracks();
      const name = err instanceof DOMException ? err.name : '';
      setError(name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Microphone access is blocked. Allow microphone access in your browser, then try again.'
        : name === 'NotFoundError'
          ? 'No microphone was found. Connect a microphone or type the medicine name.'
          : 'Could not start the microphone. Please try again.');
    }
  };

  const stopRecording = () => {
    clearTimers();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`${isRecording
          ? 'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md'
          : 'flex items-center gap-1.5 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition'} ${className}`}
        title={isRecording ? 'Stop recording and search' : 'Search by speaking a medicine name'}
        aria-label={isRecording ? `Stop voice search, ${recordingSeconds} seconds recorded` : 'Search by speaking a medicine name'}
        aria-pressed={isRecording}
      >
        {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : isRecording ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        {isRecording ? <span>Stop · {recordingSeconds}s</span> : isTranscribing ? <span className="text-xs">Transcribing…</span> : buttonText && <span>{buttonText}</span>}
      </button>
      {error && (
        <div role="status" className="absolute right-0 top-full mt-2 z-50 flex w-64 items-start gap-2 rounded-lg border border-rose-200 bg-white p-2.5 text-left text-xs text-rose-700 shadow-lg dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
