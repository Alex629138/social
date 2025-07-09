'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1.01],
        }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-foreground"
        >
          Loading protected content...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;