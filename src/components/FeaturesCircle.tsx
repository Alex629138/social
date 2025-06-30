"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";


const features = [
  {
    icon: MessageSquare,
    title: "Chat",
    desc: "Spark conversations with friends",
    href: "/messages",
  },
  {
    icon: Heart,
    title: "Connect",
    desc: "Share your favorite moments",
    href: "/feed",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Meet new people, make new friends",
    href: "/people",
  },
];

export function FeatureCircles() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="grid grid-cols-3 lg:flex justify-center gap-8 mb-12 w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Link
            key={index} 
            href={feature.href}
            className="relative">
            {/* Floating feature circle */}
            <motion.div
              className="flex flex-col items-center justify-center bg-yellow-100 text-center rounded-full border-2 border-yellow-300 p-6 lg:p-10 cursor-pointer relative z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                y: {
                  duration: 3 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              onHoverStart={() => setActiveIndex(index)}
              onHoverEnd={() => setActiveIndex(null)}
            >
              <Icon className="h-10 w-10 text-yellow-600 fill-yellow-500/20" />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-yellow-200 shadow-lg rounded-lg p-4 min-w-[200px] z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-bold text-yellow-600">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </motion.div>
  );
}