"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { 
  Cog, 
  Hammer, 
  Wrench, 
  Settings,
  Rocket,
  Star,
  Zap,
  ShieldCheck,
  CogIcon
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const container = useRef(null);
  const hammerRef = useRef(null);
  const cogRef = useRef(null);
  const wrenchRef = useRef(null);

  return (
    <main
      ref={container}
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-t from-yellow-500 to-white text-center p-4 overflow-hidden relative"
     >
      {/* Floating animated icons */}
      <motion.div
        className="absolute left-8 top-20 z-0"
        animate={{ 
          y: [0, -30, 0], 
          rotate: [0, 15, -15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Rocket className="h-16 w-16 text-black fill-yellow-500 drop-shadow-lg opacity-70" />
      </motion.div>

      <motion.div
        className="absolute right-12 top-36 z-0"
        animate={{ 
          y: [0, 40, 0], 
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <ShieldCheck className="h-14 w-14 text-black fill-yellow-500 drop-shadow-lg opacity-60" />
      </motion.div>

      <motion.div
        className="absolute left-1/4 top-1/4 z-0"
        animate={{ 
          x: [0, 20, -20, 0],
          y: [0, -15, 15, 0],
          rotate: [0, 360]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Star className="h-12 w-12 text-black fill-yellow-500 drop-shadow-lg opacity-50" />
      </motion.div>

      <motion.div
        className="absolute right-1/4 bottom-1/3 z-0"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -180, -360]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Zap className="h-14 w-14 text-black fill-yellow-500 drop-shadow-lg opacity-60" />
      </motion.div>

      {/* Logo */}
      <div>
        <Image src="/logo.jpg" alt="Logo" width={100} height={100} />
      </div>

      {/* Enhanced title with gradient text */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold relative z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <span className="text-black">
          Feed
        </span>
        <span className="text-yellow-500">
          Link
        </span>
      </motion.h1>

      <motion.p 
        className="text-xl md:text-2xl mt-4 text-black relative z-10 font-semibold"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        Is Currently Under Maintenance
      </motion.p>

      {/* Enhanced tool animation section */}
      <div className="relative mt-12 w-full max-w-md h-48 flex justify-center items-center z-10">
        {/* Main cog */}
        <motion.div
          ref={cogRef}
          className="absolute left-0 top-1/2 -translate-y-1/2"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="h-20 w-20 text-black drop-shadow-xl" />
        </motion.div>

        {/* Secondary smaller cog */}
        <motion.div
          className="absolute left-12 top-8"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="h-12 w-12 text-black drop-shadow-lg" />
        </motion.div>

        {/* Hammer with enhanced animation */}
        <motion.div
          ref={hammerRef}
          className="absolute -top-8 right-8"
          animate={{
            rotate: [0, -45, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: "bottom center" }}
        >
          <Hammer className="h-20 w-20 text-black drop-shadow-xl" />
        </motion.div>

        {/* Wrench */}
        <motion.div
          ref={wrenchRef}
          className="absolute right-0 bottom-0"
          animate={{
            rotate: [0, 15, -15, 0],
            y: [0, -5, 5, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Wrench className="h-16 w-16 text-black drop-shadow-lg" />
        </motion.div>

        {/* Tool icon */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Settings className="h-14 w-14 text-black drop-shadow-lg" />
        </motion.div>

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 200">
          <motion.path
            d="M50 100 Q150 50 250 100"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Enhanced final message with icon */}
      <motion.div
        className="relative z-10 max-w-lg mx-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.2, type: "spring" }}
      >
        <p className="text-lg text-black leading-relaxed">
          Our team is crafting something amazing. We'll be back with a better experience very soon!
        </p>
        
        {/* Progress bar animation */}
        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-black rounded-full"
            animate={{ width: ["0%", "75%", "90%", "75%"] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          />
        </div>
        <p className="text-sm text-black mt-2">Almost there...</p>
      </motion.div>
    </main>
  );
}