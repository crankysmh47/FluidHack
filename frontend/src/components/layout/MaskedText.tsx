// src/components/layout/MaskedText.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MaskedTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export const MaskedText: React.FC<MaskedTextProps> = ({ 
  text, 
  className, 
  delay = 0,
  once = true 
}) => {
  const letters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1
      className={cn("flex overflow-hidden", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {letters.map((letter, index) => (
        <motion.span 
          variants={child} 
          key={index}
          className={letter === " " ? "mr-2" : ""}
        >
          {letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};
