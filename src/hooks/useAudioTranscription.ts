import { useState, useRef } from 'react';

export function useAudioTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    setTranscription('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        await handleSendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError(err.message || 'Microphone access is required for transcription');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: blob.type || 'audio/webm',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscription(data.text);
      return data.text;
    } catch (err: any) {
      console.error('Transcription API error:', err);
      setError(err.message || 'Failed to transcribe audio with Gemini 3.5');
      return '';
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isRecording,
    isTranscribing,
    transcription,
    error,
    startRecording,
    stopRecording,
    setTranscription,
  };
}
