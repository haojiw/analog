import { createContext, useContext, useState, ReactNode } from 'react';

type RecordingContextValue = {
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
};

const RecordingContext = createContext<RecordingContextValue>({
  isRecording: false,
  setIsRecording: () => {},
});

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  return useContext(RecordingContext);
}
