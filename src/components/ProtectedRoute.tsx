"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Lock, Shield, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4">
        {/* Animated security shield */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
          className="relative mb-8"
        >
          <Shield className="h-16 w-16 text-primary" />
          
          {/* Floating lock animation */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2"
          >
            <Lock className="h-6 w-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Loading text with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center mb-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            <motion.span 
              className="text-xl font-medium text-foreground"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            >
              Securing your space...
            </motion.span>
          </div>

          {/* Animated dots */}
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.2
                }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>

        {/* Rocket animation at bottom */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <motion.div
            animate={{
              x: [0, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          >
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <motion.p
            className="text-sm text-muted-foreground mt-2"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          >
            Preparing your launch...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}