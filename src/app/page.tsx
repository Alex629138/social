"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Heart, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    setBubbles(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.6 + 0.4,
        size: Math.random() * 40 + 20,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Floating animated bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ x: b.x, y: b.y, scale: b.scale }}
            animate={{ y: [b.y, -100], opacity: [1, 0] }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              repeatType: "loop",
              delay: b.delay,
            }}
            className="absolute bg-yellow-500/80 rounded-full blur-md"
            style={{
              width: b.size,
              height: b.size,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-18 lg:py-12 flex flex-col items-center justify-center text-center z-10 relative">
        {/* Animated logo */}
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
            <Sparkles className="h-9 w-9 text-yellow-500 mx-auto" />
          </motion.div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-black mb-12 max-w-2xl leading-relaxed"
        >
          The <span className="text-yellow-500 font-semibold">fun</span>,{" "}
          <span className="text-yellow-500 font-semibold">friendly</span> way to connect.
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            {
              icon: MessageSquare,
              title: "Chat",
              desc: "Spark conversations with friends old and new",
            },
            {
              icon: Heart,
              title: "Connect",
              desc: "Share your favorite moments",
            },
            {
              icon: Users,
              title: "Community",
              desc: "Meet new people, make new friends",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-yellow-100 p-6 rounded-2xl shadow-xl border border-yellow-500 transition-all"
            >
              <motion.div
                className="mb-4"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4 + i,
                  ease: "easeInOut",
                  delay: i,
                }}
              >
                <Icon className="h-9 w-9 text-yellow-500 mx-auto" />
              </motion.div>
              <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
              <p className="text-gray-700">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button className="bg-yellow-500 hover:bg-black hover:text-white text-black text-lg px-10 py-5 rounded-md shadow-lg cursor-pointer">
            <Link href="/create-post">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <span className="font-semibold">Share a post</span>
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
          </Button>
        </motion.div>

        {/* Footer sparkle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-black/60"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 mx-auto text-yellow-500" />
          </motion.div>
          <Link
            href="/create-post"
            className="mt-1 text-sm"
          >
            Start sharing your world today
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
