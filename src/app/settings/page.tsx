"use client";

import { Construction, Clock, Home, Hammer, Wrench, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const constructionItems = [
  { icon: <Hammer className="h-6 w-6" />, name: "Hammer" },
  { icon: <Wrench className="h-6 w-6" />, name: "Wrench" },
  { icon: <HardHat className="h-6 w-6" />, name: "Hard Hat" },
];

export default function UnderConstruction() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate progress animation
    if (progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 100));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-br from-muted/40 to-background">
        <div className="max-w-md w-full space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Construction 
                className={cn(
                  "h-16 w-16 text-primary transition-all duration-300",
                  isAnimating ? "rotate-45 scale-110" : ""
                )} 
              />
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2"
              >
                <HardHat className="h-6 w-6 text-yellow-500" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-primary to-yellow-500">
              Under Construction!
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Our digital builders are hard at work!
            </p>
          </motion.div>

          <div className="space-y-6">
            <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="absolute h-full bg-gradient-to-r from-primary to-yellow-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-background">
                  {Math.round(progress)}% complete
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {constructionItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  {item.icon}
                  <span className="text-xs">{item.name}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <Link href="/">
                <Button 
                  variant="default" 
                  className="flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  asChild
                >
                  <motion.div>
                    <Home className="h-4 w-4" />
                    Go Home
                  </motion.div>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={triggerAnimation}
                disabled={progress >= 100}
              >
                <Clock className="h-4 w-4" />
                {progress >= 100 ? "Almost Done!" : "Check Progress"}
              </Button>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm text-muted-foreground pt-4"
          >
            Thanks for your patience while we build something awesome!
          </motion.p>
        </div>
      </main>
    </ProtectedRoute>
  );
}