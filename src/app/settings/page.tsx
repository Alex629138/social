"use client";

import { Construction, Clock, Home, Hammer, Wrench, HardHat, Sparkles, AlertTriangle, GitPullRequest, Cog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const constructionItems = [
  { icon: <Hammer className="h-6 w-6" />, name: "Hammer" },
  { icon: <Wrench className="h-6 w-6" />, name: "Wrench" },
  { icon: <HardHat className="h-6 w-6" />, name: "Hard Hat" },
  { icon: <Cog className="h-6 w-6" />, name: "Gears" },
  { icon: <GitPullRequest className="h-6 w-6" />, name: "Code" },
  { icon: <AlertTriangle className="h-6 w-6" />, name: "Warning" },
];

export default function UnderConstruction() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setIsLoading(true);
    setTimeout(() => {
      setIsAnimating(false);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-br from-muted/40 to-background overflow-hidden">
        {/* Floating construction elements */}
        <motion.div 
          className="absolute top-20 left-10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        >
          <Wrench className="h-8 w-8 text-yellow-600 opacity-60" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-20"
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <HardHat className="h-10 w-10 text-orange-500 opacity-60" />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/4 right-1/4"
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "linear"
          }}
        >
          <Cog className="h-12 w-12 text-muted-foreground opacity-40" />
        </motion.div>

        <div className="max-w-md w-full space-y-8 relative z-10">
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
              
              {/* Animated hard hat */}
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
              
              {/* Animated hammer */}
              <motion.div
                animate={{ 
                  rotate: [0, 70, -40, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute top-2 right-24"
              >
                <Hammer className="h-18 w-18 text-black" />
              </motion.div>
              
              {/* Sparkles when animating */}
              {isAnimating && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 0], opacity: [1, 0] }}
                  transition={{ duration: 1 }}
                  className="absolute -inset-2 flex justify-center items-center"
                >
                  <Sparkles className="h-24 w-24 text-yellow-400" />
                </motion.div>
              )}
            </div>
            
            <motion.h1 
              className="text-4xl font-bold text-foreground bg-clip-text bg-gradient-to-r from-primary to-yellow-500"
              animate={isAnimating ? {
                scale: [1, 1.05, 1],
                color: ["#000000", "#f59e0b", "#000000"]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              Under Construction!
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground"
              animate={isAnimating ? {
                x: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.3 }}
            >
              Our digital builders are hard at work!
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {constructionItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  whileHover={{ 
                    y: -5,
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: 20 }}
                  >
                    {item.icon}
                  </motion.div>
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
                  asChild
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </motion.div>
                </Button>
              </Link>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  className="gap-2 min-w-32"
                  onClick={triggerAnimation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      Almost Done!
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm text-muted-foreground pt-4 space-y-2"
          >
            <p>Thanks for your patience while we build something awesome!</p>
            <motion.div
              animate={isAnimating ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              } : {}}
              transition={{ duration: 0.5 }}
              className="flex justify-center gap-1"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>Coming soon!</span>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}