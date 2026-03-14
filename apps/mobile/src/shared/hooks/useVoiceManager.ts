import { useRef, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import {
  AudioModule,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  AudioQuality,
} from 'expo-audio';
import { useRecording } from '../../core/providers/RecordingContext';
import { getDb } from '../../core/db/db';
import { insertLog } from '../../core/db/LogRepository';
import { insertEntry } from '../../core/db/EntryRepository';
import { resampleLevels } from '../utils/audio';

export type VoiceStatus = 'idle' | 'listening' | 'paused' | 'saving';

const TRANSCRIPTION_PRESET = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 32000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'mpeg4' as const,
    audioEncoder: 'aac' as const,
  },
  ios: {
    audioQuality: AudioQuality.MEDIUM,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 32000,
  },
};

export function useVoiceManager() {
  useKeepAwake();

  const { isRecording, setIsRecording } = useRecording();
  const [isPaused, setIsPaused]         = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [audioLevels, setAudioLevels]   = useState<number[]>([]);

  const saveTimer        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meteringInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const allLevelsRef     = useRef<number[]>([]);

  const audioRecorder    = useAudioRecorder(TRANSCRIPTION_PRESET);
  const recorderState    = useAudioRecorderState(audioRecorder, 100);
  const recorderStateRef = useRef(recorderState);
  recorderStateRef.current = recorderState;

  // Reset pause when recording stops
  useEffect(() => {
    if (!isRecording) setIsPaused(false);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (meteringInterval.current) clearInterval(meteringInterval.current);
  }, []);

  const status: VoiceStatus = isRecording
    ? (isPaused ? 'paused' : 'listening')
    : (isSaving ? 'saving' : 'idle');

  const startMetering = useCallback(() => {
    meteringInterval.current = setInterval(() => {
      const state = recorderStateRef.current;
      if (state.isRecording && state.metering !== undefined) {
        const db = state.metering ?? -160;
        const normalized = db < -30
          ? 0
          : Math.pow(Math.min(1, (db + 30) / 30), 0.6);

        allLevelsRef.current.push(normalized);

        setAudioLevels(prev =>
          prev.length < 50
            ? [...prev, normalized]
            : [...prev.slice(1), normalized],
        );
      }
    }, 70);
  }, []);

  const stopMetering = useCallback(() => {
    if (meteringInterval.current) {
      clearInterval(meteringInterval.current);
      meteringInterval.current = null;
    }
  }, []);

  const toggleRecord = useCallback(async () => {
    if (isRecording) {
      // STOP
      setIsRecording(false);
      stopMetering();

      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      const durationMs = recorderStateRef.current.durationMillis ?? 0;
      const waveform = resampleLevels(allLevelsRef.current, 200);

      const db = await getDb();
      const log = await insertLog(db, { user_id: null });
      await insertEntry(db, {
        log_id: log.id,
        position: 0,
        type: 'audio',
        audio_url: uri ?? undefined,
        duration_ms: durationMs,
        waveform,
      });

      setIsSaving(true);
      saveTimer.current = setTimeout(() => setIsSaving(false), 1500);
    } else {
      // START
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setIsSaving(false);

      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Analog needs microphone access to record your thoughts. Please enable it in Settings.',
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'doNotMix',
      });

      allLevelsRef.current = [];
      setAudioLevels([]);

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      startMetering();
      setIsRecording(true);
    }
  }, [isRecording, setIsRecording, audioRecorder, startMetering, stopMetering]);

  const togglePause = useCallback(() => {
    if (!isRecording) return;
    if (isPaused) {
      audioRecorder.record();
      startMetering();
      setIsPaused(false);
    } else {
      audioRecorder.pause();
      stopMetering();
      setIsPaused(true);
    }
  }, [isRecording, isPaused, audioRecorder, startMetering, stopMetering]);

  const discard = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    stopMetering();
    await audioRecorder.stop();
    setIsRecording(false);
    setIsSaving(false);
  }, [setIsRecording, audioRecorder, stopMetering]);

  return { status, isRecording, audioLevels, toggleRecord, togglePause, discard };
}
