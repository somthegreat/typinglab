import { useCallback } from 'react';
import { useTestResults } from './useTestResults';
import { useProfile } from './useProfile';
import { useWeakKeys } from './useWeakKeys';
import { format } from 'date-fns';

interface ExportData {
  exportedAt: string;
  version: string;
  profile: {
    username: string | null;
    bestWpm: number | null;
    bestAccuracy: number | null;
    totalTestsCompleted: number | null;
    totalWordsTyped: number | null;
    currentStreak: number | null;
    longestStreak: number | null;
    level: number | null;
    xp: number | null;
    skillTier: string | null;
  };
  testResults: {
    date: string;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    mode: string;
    duration: number | null;
    correctChars: number;
    incorrectChars: number;
  }[];
  weakKeys: {
    key: string;
    errorCount: number;
    totalCount: number;
    errorRate: number;
  }[];
}

export const useDataExport = () => {
  const { data: testResults } = useTestResults();
  const { data: profile } = useProfile();
  const { data: weakKeys } = useWeakKeys();

  const exportToJSON = useCallback(() => {
    const data: ExportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      profile: {
        username: profile?.username || null,
        bestWpm: profile?.best_wpm || null,
        bestAccuracy: profile?.best_accuracy || null,
        totalTestsCompleted: profile?.total_tests_completed || null,
        totalWordsTyped: profile?.total_words_typed || null,
        currentStreak: profile?.current_streak || null,
        longestStreak: profile?.longest_streak || null,
        level: profile?.level || null,
        xp: profile?.xp || null,
        skillTier: profile?.skill_tier || null,
      },
      testResults: (testResults || []).map(r => ({
        date: r.created_at || '',
        wpm: r.wpm,
        rawWpm: r.raw_wpm,
        accuracy: r.accuracy,
        mode: r.test_mode,
        duration: r.test_duration,
        correctChars: r.correct_chars,
        incorrectChars: r.incorrect_chars,
      })),
      weakKeys: (weakKeys || []).map(k => ({
        key: k.key_char,
        errorCount: k.error_count,
        totalCount: k.total_count,
        errorRate: k.error_rate,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [testResults, profile, weakKeys]);

  const exportToCSV = useCallback(() => {
    if (!testResults || testResults.length === 0) return;

    const headers = ['Date', 'WPM', 'Raw WPM', 'Accuracy', 'Mode', 'Duration', 'Correct Chars', 'Incorrect Chars'];
    const rows = testResults.map(r => [
      r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
      r.wpm,
      r.raw_wpm,
      r.accuracy,
      r.test_mode,
      r.test_duration || '',
      r.correct_chars,
      r.incorrect_chars,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [testResults]);

  const parseImportData = useCallback((jsonString: string): ExportData | null => {
    try {
      const data = JSON.parse(jsonString) as ExportData;
      
      // Validate structure
      if (!data.version || !data.exportedAt) {
        throw new Error('Invalid export format');
      }
      
      return data;
    } catch {
      return null;
    }
  }, []);

  return {
    exportToJSON,
    exportToCSV,
    parseImportData,
    hasData: (testResults?.length ?? 0) > 0,
  };
};
