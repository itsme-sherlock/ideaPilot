'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function TypingText() {
  const texts = [
    'The fastest way to test your business idea',
    'For anyone who’s ever had an idea… and then just left it in Notes.',
    'No more blank screens. Just type your idea → get a page → see if people care.',
    'This won’t change the world. But it might help you start something.',
    'Get a live landing page and collect feedback — no code needed.',
    'Type your idea → get a page → share the link → watch responses come in.',

  ];

  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion

  // Cycle messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 6000); // Show each for 6s
    return () => clearTimeout(timer);
  }, [index]);

  const words = texts[index].split(' ');

  return (
    <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2 h-7 flex items-center overflow-hidden justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          aria-live='polite'
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion() ? 0 : 0.2, ease: 'easeInOut' }}
          className="flex flex-wrap min-h-[1.2em] leading-tight sm:text-base"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: i * 0.05,           // 50ms between words
                duration: 0.4,
                ease: [0.25, 0.8, 0.75, 1], // "easeOutCubic" – fast start, soft landing
              }}
              className="mx-0.5 whitespace-pre"
            >
              {word}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}