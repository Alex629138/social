"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Array<{
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const handleResize = () => {
      setBubbles(
        Array.from({ length: 15 }, () => ({
          x: Math.random() * (window.innerWidth - 40),
          y: Math.random() * (window.innerHeight - 40) + 40,
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

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const legalSections = {
    terms: {
      title: "Terms of Service",
      content: [
        {
          title: "1. Acceptance of Terms",
          text: "By using FeedLink, you agree to these Terms of Service and our Privacy Policy. If you don't agree, please don't use our services."
        },
        {
          title: "2. User Responsibilities",
          text: "You're responsible for all content you post and activity that occurs under your account. Keep your password secure and notify us immediately of any unauthorized use."
        },
        {
          title: "3. Content Ownership",
          text: "You retain ownership of all content you post, but grant us a worldwide license to use, display, and distribute it in connection with our services."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      content: [
        {
          title: "1. Information We Collect",
          text: "We collect information you provide when registering, content you post, and data about how you use FeedLink. This may include personal information like your name, email, and profile data."
        },
        {
          title: "2. How We Use Information",
          text: "We use your information to provide and improve our services, personalize content, and communicate with you. We don't sell your personal data to third parties."
        },
        {
          title: "3. Data Security",
          text: "We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure."
        }
      ]
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-yellow-50 overflow-hidden">
      <Navbar />
      
      {/* Floating bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ x: b.x, y: b.y }}
            animate={{ y: [b.y, -b.size], opacity: [1, 0] }}
            transition={{ duration: b.duration, repeat: Infinity, delay: b.delay }}
            className="absolute bg-yellow-500/20 rounded-full blur-sm"
            style={{ width: b.size, height: b.size }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20 z-10 relative"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex justify-center mb-12"
        >
          <h1 className="text-4xl font-bold">
            <span className="text-black">Legal</span>
            <span className="text-yellow-500">Center</span>
          </h1>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {Object.entries(legalSections).map(([key, section]) => (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: key === 'terms' ? 0.2 : 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-100"
            >
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <h2 className="text-2xl font-semibold text-gray-800">
                  {section.title}
                </h2>
                {activeSection === key ? (
                  <ChevronUp className="h-6 w-6 text-yellow-500" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-yellow-500" />
                )}
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: activeSection === key ? 'auto' : 0,
                  opacity: activeSection === key ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="px-6 overflow-hidden"
              >
                <div className="pb-6 space-y-6">
                  {section.content.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: activeSection === key ? 1 : 0,
                        x: activeSection === key ? 0 : -20
                      }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-yellow-50 pb-4 last:border-0"
                    >
                      <h3 className="text-lg font-medium text-yellow-600 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-8"
          >
            <Button 
              variant="outline" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back to Top
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}