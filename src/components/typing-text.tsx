'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TypingText() {
  const texts = [
    'I kept having ideas but never starting. So I built this to finally test one.',
    'For anyone who’s ever had an idea… and then just left it in Notes.',
    'No more blank screens. Just type your idea → get a page → see if people care.',
    'This won’t change the world. But it might help you start something.',
    'Not every idea is good. But none of them are real until you test.',
    'Type your idea → get a page → share the link → watch responses come in. No planning. No hesitation. Just action.',

  ];

  const [index, setIndex] = useState(0);

  // Cycle messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 4000); // Show each for 4s
    return () => clearTimeout(timer);
  }, [index]);

  const words = texts[index].split(' ');

  return (
    <p className="text-sm text-muted-foreground mt-2 h-6 flex items-center overflow-hidden justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap min-h-[1.2em] leading-tight"
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