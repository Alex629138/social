"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, TwitterAuthProvider, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserToFirestore } from "@/lib/saveUserToFirestore";
import { BsGoogle, BsMicrosoft, BsTwitterX } from "react-icons/bs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState<null | 'google' | 'microsoft' | 'twitter'>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const [bubbles, setBubbles] = useState<Array<{
    x: number;
    y: number;
    scale: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  const handleSocialLogin = async (provider: GoogleAuthProvider | OAuthProvider | TwitterAuthProvider) => {
    setIsLoading(provider instanceof GoogleAuthProvider ? 'google' : TwitterAuthProvider ? 'twitter' : 'microsoft');
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserToFirestore(user);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  };

  const handleTwitterLogin = () => {
    const provider = new TwitterAuthProvider();
    handleSocialLogin(provider);
  };

  const handleMicrosoftLogin = () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('openid');
    provider.addScope('email');
    provider.addScope('profile');
    handleSocialLogin(provider);
  };

  useEffect(() => {
    const handleResize = () => {
      setBubbles(
        Array.from({ length: 15 }, () => ({
          x: Math.random() * (window.innerWidth - 40),
          y: Math.random() * (window.innerHeight - 40) + 40,
          scale: Math.random() * 0.6 + 0.4,
          size: Math.random() * 30 + 20,
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
    <main className="relative flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-white to-yellow-50 overflow-hidden">
      {/* Background bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ x: b.x, y: b.y, scale: b.scale }}
            animate={{ y: [b.y, -b.size], opacity: [1, 0] }}
            transition={{ duration: b.duration, repeat: Infinity, delay: b.delay }}
            className="absolute bg-yellow-500/20 rounded-full blur-sm"
            style={{ width: b.size, height: b.size }}
          />
        ))}
      </div>

      {/* Login card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md z-10 flex flex-col items-center justify-center"
        >
        <div className="flex flex-col items-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-4"
          >
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={120}
              height={120}
            />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-black">Feed</span>
            <span className="text-yellow-500">Link</span>
          </motion.h1>
          <motion.p
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Connect with your prefered provider
          </motion.p>
        </div>

        {/* Floating provider circles */}
        <div className="w-full flex flex-wrap lg:flex-row justify-between items-center space-y-8 mb-12">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-100 px-4 py-2 rounded-full"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
            >
            <motion.button
              onClick={handleGoogleLogin}
              disabled={!!isLoading}
              className={`w-24 h-24 hover:bg-black hover:text-white rounded-full bg-yellow-500 shadow-lg flex flex-col items-center justify-center ${
                isLoading === 'google' ? 'cursor-wait' : 'cursor-pointer hover:shadow-xl'
              }`}
              animate={{
                y: [0, -10, 0],
                rotate: isLoading === 'google' ? [0, 360] : 0
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: isLoading === 'google' ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
              }}
              >
              {isLoading === 'google' ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <>
                  <BsGoogle className="text-3xl mb-1"/>
                  <span className="text-sm font-medium">Google</span>
                </>
              )}
            </motion.button>
            <motion.div
              className="absolute -inset-2 bg-yellow-500 rounded-full -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
            >
            <motion.button
              onClick={handleTwitterLogin}
              disabled={!!isLoading}
              className={`w-24 h-24 hover:bg-black hover:text-white rounded-full bg-gray-400 shadow-lg flex flex-col items-center justify-center ${
                isLoading === 'twitter' ? 'cursor-wait' : 'cursor-pointer hover:shadow-xl'
              }`}
              animate={{
                y: [0, -10, 0],
                rotate: isLoading === 'twitter' ? [0, 360] : 0
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                rotate: isLoading === 'twitter' ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
              }}
            >
              {isLoading === 'twitter' ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <>
                  <BsTwitterX className="text-3xl mb-1"/>
                  <span className="text-sm font-medium">Twitter/X</span>
                </>
              )}
            </motion.button>
            <motion.div
              className="absolute -inset-2 bg-gray-500 rounded-full -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.5
              }}
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
            >
            <motion.button
              onClick={handleMicrosoftLogin}
              disabled={!!isLoading}
              className={`w-24 h-24 hover:bg-black hover:text-white rounded-full bg-blue-500 shadow-lg flex flex-col items-center justify-center ${
                isLoading === 'microsoft' ? 'cursor-wait' : 'cursor-pointer hover:shadow-xl'
              }`}
              animate={{
                y: [0, -10, 0],
                rotate: isLoading === 'microsoft' ? [0, 360] : 0
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                rotate: isLoading === 'microsoft' ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
              }}
            >
              {isLoading === 'microsoft' ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <>
                  <BsMicrosoft className="text-3xl mb-1"/>
                  <span className="text-sm font-medium">Microsoft</span>
                </>
              )}
            </motion.button>
            <motion.div
              className="absolute -inset-2 bg-blue-500 rounded-full -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 0.5
              }}
            />
          </motion.div>
        </div>
        <Link href="/legal">
          <Button className="w-full max-w-xs text-black bg-yellow-500 hover:bg-black hover:text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors">
            Terms of Service and Privacy Policy
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}