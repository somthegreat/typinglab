import { useState, useCallback, useRef } from 'react';

export interface CheatDetection {
  type: 'copy_paste' | 'unusual_speed' | 'bot_pattern' | 'focus_loss' | 'suspicious_timing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
}

interface KeyTiming {
  key: string;
  timestamp: number;
  interval: number;
}

export const useAntiCheat = () => {
  const [detections, setDetections] = useState<CheatDetection[]>([]);
  const [isValid, setIsValid] = useState(true);
  const keyTimingsRef = useRef<KeyTiming[]>([]);
  const lastKeyTimeRef = useRef<number>(0);
  const focusLossCountRef = useRef<number>(0);
  const pasteCountRef = useRef<number>(0);

  const addDetection = useCallback((detection: Omit<CheatDetection, 'timestamp'>) => {
    const newDetection: CheatDetection = {
      ...detection,
      timestamp: Date.now(),
    };
    setDetections(prev => [...prev, newDetection]);
    
    // Mark as invalid if high severity
    if (detection.severity === 'high') {
      setIsValid(false);
    }
  }, []);

  const checkKeyTiming = useCallback((key: string): boolean => {
    const now = Date.now();
    const interval = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
    
    keyTimingsRef.current.push({ key, timestamp: now, interval });
    lastKeyTimeRef.current = now;

    // Keep only last 50 keystrokes for analysis
    if (keyTimingsRef.current.length > 50) {
      keyTimingsRef.current = keyTimingsRef.current.slice(-50);
    }

    // Check for suspiciously consistent timing (bot-like)
    if (keyTimingsRef.current.length >= 20) {
      const intervals = keyTimingsRef.current.slice(-20).map(k => k.interval).filter(i => i > 0);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      
      // Human typing has variation; bots are consistent
      if (stdDev < 15 && avgInterval < 100) {
        addDetection({
          type: 'bot_pattern',
          severity: 'high',
          message: 'Suspiciously consistent key timing detected',
        });
        return false;
      }
    }

    // Check for impossibly fast typing (< 20ms between keys consistently)
    if (interval > 0 && interval < 20) {
      const recentFast = keyTimingsRef.current.slice(-10).filter(k => k.interval > 0 && k.interval < 20);
      if (recentFast.length >= 5) {
        addDetection({
          type: 'unusual_speed',
          severity: 'high',
          message: 'Impossibly fast typing speed detected',
        });
        return false;
      }
    }

    return true;
  }, [addDetection]);

  const checkPaste = useCallback((e: ClipboardEvent | React.ClipboardEvent): boolean => {
    pasteCountRef.current++;
    
    addDetection({
      type: 'copy_paste',
      severity: pasteCountRef.current > 2 ? 'high' : 'medium',
      message: `Paste detected (${pasteCountRef.current} time${pasteCountRef.current > 1 ? 's' : ''})`,
    });

    if (pasteCountRef.current > 2) {
      setIsValid(false);
    }

    return pasteCountRef.current <= 2;
  }, [addDetection]);

  const checkFocusLoss = useCallback((): boolean => {
    focusLossCountRef.current++;
    
    if (focusLossCountRef.current > 3) {
      addDetection({
        type: 'focus_loss',
        severity: 'medium',
        message: `Window focus lost multiple times (${focusLossCountRef.current})`,
      });
    }

    return focusLossCountRef.current <= 5;
  }, [addDetection]);

  const checkWpmSpike = useCallback((currentWpm: number, previousWpm: number): boolean => {
    // Check for sudden WPM spikes (more than 50 WPM increase suddenly)
    if (previousWpm > 0 && currentWpm - previousWpm > 50) {
      addDetection({
        type: 'suspicious_timing',
        severity: 'medium',
        message: `Sudden WPM spike detected: ${previousWpm} → ${currentWpm}`,
      });
      return false;
    }

    // Check for impossibly high WPM (world record is ~216 WPM sustained)
    if (currentWpm > 250) {
      addDetection({
        type: 'unusual_speed',
        severity: 'high',
        message: `WPM exceeds human limits: ${currentWpm}`,
      });
      setIsValid(false);
      return false;
    }

    return true;
  }, [addDetection]);

  const reset = useCallback(() => {
    setDetections([]);
    setIsValid(true);
    keyTimingsRef.current = [];
    lastKeyTimeRef.current = 0;
    focusLossCountRef.current = 0;
    pasteCountRef.current = 0;
  }, []);

  const getValidationStatus = useCallback((): { 
    isValid: boolean; 
    score: number; 
    warnings: CheatDetection[] 
  } => {
    const highSeverity = detections.filter(d => d.severity === 'high');
    const mediumSeverity = detections.filter(d => d.severity === 'medium');
    
    // Calculate trust score (100 = completely trusted)
    let score = 100;
    score -= highSeverity.length * 30;
    score -= mediumSeverity.length * 10;
    score = Math.max(0, score);

    return {
      isValid: isValid && score >= 50,
      score,
      warnings: detections,
    };
  }, [detections, isValid]);

  return {
    detections,
    isValid,
    checkKeyTiming,
    checkPaste,
    checkFocusLoss,
    checkWpmSpike,
    getValidationStatus,
    reset,
  };
};
