import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // Typing speed in milliseconds
  delay?: number; // Delay before starting
  loop?: boolean; // Whether to loop the animation
  deleteSpeed?: number; // Speed for deleting (if looping)
  pauseTime?: number; // Pause time before deleting (if looping)
}

/**
 * Custom hook for typewriter effect
 */
export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  deleteSpeed = 30,
  pauseTime = 2000,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setCurrentIndex(0);
    }
  }, [delay, text]);

  useEffect(() => {
    if (currentIndex < 0) {
      setCurrentIndex(0);
      setIsDeleting(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          // Finished typing
          if (loop) {
            // Wait before starting to delete
            setTimeout(() => {
              setIsDeleting(true);
            }, pauseTime);
          }
        }
      } else {
        // Deleting
        if (currentIndex > 0) {
          setDisplayText(text.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          // Finished deleting, start typing again
          setIsDeleting(false);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, deleteSpeed, isDeleting, loop, pauseTime]);

  return displayText;
}

