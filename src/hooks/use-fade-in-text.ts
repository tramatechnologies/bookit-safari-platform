import { useState, useEffect } from 'react';

interface UseFadeInTextOptions {
  words: string[];
  delay?: number; // Delay before starting
  interval?: number; // Time between each word
  duration?: number; // Animation duration per word
}

/**
 * Custom hook for fade-in text effect (word by word)
 */
export function useFadeInText({
  words,
  delay = 0,
  interval = 200,
  duration = 500,
}: UseFadeInTextOptions) {
  const [visibleWords, setVisibleWords] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setStarted(true);
    }
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    const timers: NodeJS.Timeout[] = [];

    const showNextWord = () => {
      if (currentIndex < words.length) {
        setVisibleWords((prev) => [...prev, currentIndex]);
        currentIndex++;

        if (currentIndex < words.length) {
          const timer = setTimeout(showNextWord, interval);
          timers.push(timer);
        }
      }
    };

    showNextWord();

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [started, words, interval]);

  return { visibleWords, duration };
}

