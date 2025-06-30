"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { FeatureCircles } from "@/components/FeaturesCircle";

export default function IntroPage() {
  const [bubbles, setBubbles] = useState<Array<{
    x: number;
    y: number;
    scale: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // This code runs only on the client side
    const handleResize = () => {
      setBubbles(
        Array.from({ length: 20 }, () => ({
          x: Math.random() * (window.innerWidth - 40), // Subtract bubble size
          y: Math.random() * (window.innerHeight - 40) + 40, // Start below top edge
          scale: Math.random() * 0.6 + 0.4,
          size: Math.random() * 30 + 20, // Reduced max size
          duration: Math.random() * 10 + 8,
          delay: Math.random() * 5,
        }))
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar />
      <div className="relative max-h-screen w-full bg-white overflow-hidden">
        {/* Floating animated bubbles - now properly constrained */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {bubbles.map((b, i) => (
            <motion.div
              key={i}
              initial={{ x: b.x, y: b.y, scale: b.scale }}
              animate={{ 
                y: [b.y, -b.size], 
                opacity: [1, 0] 
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                repeatType: "loop",
                delay: b.delay,
              }}
              className="absolute bg-yellow-500/80 rounded-full blur-sm" 
              style={{
                width: b.size,
                height: b.size,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-18 lg:pt-12 flex flex-col items-center justify-center text-center z-10 relative">
          {/* Rest of your content remains the same */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            className="mb-10"
          >
            <motion.h1
              className="text-7xl font-extrabold tracking-tight mb-2"
              whileHover={{ scale: 1.06 }}
            >
              <span className="text-black">Feed</span>
              <span className="text-yellow-500">Link</span>
            </motion.h1>

            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -6, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
            >
              <Image 
                src="/logo.jpg"
                alt="FeedLink Logo"
                width={100}
                height={100}
                className="mx-auto"    
              />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-black mb-12 max-w-2xl leading-relaxed"
          >
            The <span className="text-yellow-500 font-semibold">fun</span>,{" "}
            <span className="text-yellow-500 font-semibold">friendly</span> way to connect.
          </motion.p>

          <motion.div
            className="flex justify-center gap-8  w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FeatureCircles/>
          </motion.div>
        </div>
      </div>
    </>
  );
}