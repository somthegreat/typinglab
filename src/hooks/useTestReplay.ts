import { useState, useCallback, useRef } from 'react';

export interface ReplayEvent {
  timestamp: number;
  type: 'keypress' | 'error' | 'backspace';
  key: string;
  index: number;
  wpm: number;
  accuracy: number;
}

export interface TestReplay {
  id: string;
  events: ReplayEvent[];
  targetText: string;
  finalWpm: number;
  finalAccuracy: number;
  duration: number;
  createdAt: Date;
}

export const useTestReplay = () => {
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(() => {
    setEvents([]);
    setIsRecording(true);
    startTimeRef.current = Date.now();
  }, []);

  const recordEvent = useCallback((
    type: ReplayEvent['type'],
    key: string,
    index: number,
    wpm: number,
    accuracy: number
  ) => {
    if (!isRecording) return;
    
    const event: ReplayEvent = {
      timestamp: Date.now() - startTimeRef.current,
      type,
      key,
      index,
      wpm,
      accuracy,
    };
    
    setEvents(prev => [...prev, event]);
  }, [isRecording]);

  const stopRecording = useCallback((
    targetText: string,
    finalWpm: number,
    finalAccuracy: number
  ): TestReplay => {
    setIsRecording(false);
    const duration = Date.now() - startTimeRef.current;
    
    return {
      id: crypto.randomUUID(),
      events,
      targetText,
      finalWpm,
      finalAccuracy,
      duration,
      createdAt: new Date(),
    };
  }, [events]);

  const reset = useCallback(() => {
    setEvents([]);
    setIsRecording(false);
    startTimeRef.current = 0;
  }, []);

  return {
    events,
    isRecording,
    startRecording,
    recordEvent,
    stopRecording,
    reset,
  };
};

// Replay player hook
export const useReplayPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [currentWpm, setCurrentWpm] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState(100);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playReplay = useCallback((replay: TestReplay, speed: number = 1) => {
    setIsPlaying(true);
    setCurrentEventIndex(0);
    setCurrentText('');
    setCurrentWpm(0);
    setCurrentAccuracy(100);
    setErrors(new Set());

    const playNextEvent = (index: number) => {
      if (index >= replay.events.length) {
        setIsPlaying(false);
        return;
      }

      const event = replay.events[index];
      const nextEvent = replay.events[index + 1];
      
      setCurrentEventIndex(index);
      setCurrentWpm(event.wpm);
      setCurrentAccuracy(event.accuracy);

      if (event.type === 'keypress' || event.type === 'error') {
        setCurrentText(prev => prev + event.key);
        if (event.type === 'error') {
          setErrors(prev => new Set(prev).add(event.index));
        }
      } else if (event.type === 'backspace') {
        setCurrentText(prev => prev.slice(0, -1));
        setErrors(prev => {
          const newErrors = new Set(prev);
          newErrors.delete(event.index);
          return newErrors;
        });
      }

      if (nextEvent) {
        const delay = (nextEvent.timestamp - event.timestamp) / speed;
        timeoutRef.current = setTimeout(() => playNextEvent(index + 1), Math.max(10, delay));
      } else {
        setIsPlaying(false);
      }
    };

    if (replay.events.length > 0) {
      timeoutRef.current = setTimeout(() => playNextEvent(0), replay.events[0].timestamp / speed);
    }
  }, []);

  const pauseReplay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
  }, []);

  const resetReplay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentEventIndex(0);
    setCurrentText('');
    setCurrentWpm(0);
    setCurrentAccuracy(100);
    setErrors(new Set());
  }, []);

  return {
    isPlaying,
    currentEventIndex,
    currentText,
    currentWpm,
    currentAccuracy,
    errors,
    playReplay,
    pauseReplay,
    resetReplay,
  };
};
