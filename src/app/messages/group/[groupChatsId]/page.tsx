"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { collection, addDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/Navbar";
import { Send, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function GroupChatPage() {
  const { user } = useAuth();
  const { groupChatsId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!groupChatsId || !user?.uid) return;
    const fetchGroup = async () => {
      try {
        const docSnap = await getDoc(
          doc(firestore, "groupChats", groupChatsId as string)
        );
        if (docSnap.exists()) {
          setGroup({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Group not found");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load group");
      }
    };
    fetchGroup();
  }, [groupChatsId, user?.uid]);

  useEffect(() => {
    if (!groupChatsId || !user?.uid) return;
    const msgsQuery = query(
      collection(firestore, "groupChats", groupChatsId as string, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      msgsQuery,
      (snap) => {
        setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err?.message || "Failed to load messages");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [groupChatsId, user?.uid]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !groupChatsId) return;
    try {
      await addDoc(
        collection(firestore, "groupChats", groupChatsId as string, "messages"),
        {
          text: newMessage,
          senderId: user.uid,
          senderName: user.displayName || "User",
          createdAt: serverTimestamp(),
          readBy: [user.uid],
        }
      );
      setNewMessage("");
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-24 max-w-xl mx-auto min-h-screen flex flex-col">
        <div className="py-3 border-b mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-yellow-500 text-black">
                {group?.name?.[0]?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium flex items-center gap-2">
                {group?.name || "Group Chat"} <Users className="h-4 w-4" />
              </h2>
              <p className="text-xs text-muted-foreground">
                {group?.members?.length || 0} members
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.senderId === user.uid ? "items-end" : "items-start"
                } mb-3 overflow-hidden`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  className={`max-w-xs px-4 py-3 rounded-xl ${
                    msg.senderId === user.uid
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-yellow-500 text-black rounded-tl-none"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                  <p className="text-sm">{msg.text}</p>
                </motion.div>
                <p className="text-[0.6rem] mt-1 text-muted-foreground">
                  {msg.createdAt?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center justify-between gap-2 fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 max-w-xl mx-auto">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="focus-visible:ring-0 w-full"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            className="bg-yellow-500 hover:text-white text-black"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </ProtectedRoute>
  );
}


