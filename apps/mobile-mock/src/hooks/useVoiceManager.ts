import { useRef, useState, useEffect, useCallback } from 'react';
import { useRecording } from '../context/RecordingContext';

export type VoiceStatus = 'idle' | 'listening' | 'paused' | 'saving';

export function useVoiceManager() {
  const { isRecording, setIsRecording } = useRecording();
  const [isPaused, setIsPaused]         = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset pause when recording stops
  useEffect(() => {
    if (!isRecording) setIsPaused(false);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const status: VoiceStatus = isRecording
    ? (isPaused ? 'paused' : 'listening')
    : (isSaving ? 'saving' : 'idle');

  const toggleRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setIsSaving(true);
      saveTimer.current = setTimeout(() => setIsSaving(false), 1500);
    } else {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setIsSaving(false);
      setIsRecording(true);
    }
  }, [isRecording, setIsRecording]);

  const togglePause = useCallback(() => {
    if (isRecording) setIsPaused(p => !p);
  }, [isRecording]);

  const discard = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsRecording(false);
    setIsSaving(false);
  }, [setIsRecording]);

  return { status, isRecording, toggleRecord, togglePause, discard };
}
