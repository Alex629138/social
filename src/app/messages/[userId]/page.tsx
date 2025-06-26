"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type Message = {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: any;
};

export default function ChatPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    if (!user?.uid || typeof userId !== "string") return;

    const chatQuery = query(
      collection(firestore, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg: any) =>
            (msg.senderId === user.uid && msg.recipientId === userId) ||
            (msg.senderId === userId && msg.recipientId === user.uid)
        );
      setMessages(data as Message[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.uid || typeof userId !== "string") return;

    await addDoc(collection(firestore, "messages"), {
      text: newMessage,
      senderId: user.uid,
      recipientId: userId,
      participants: [user.uid, userId],
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="pt-12 px-4 pb-24 max-w-xl mx-auto min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="py-3 border-b mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || "/placeholder.png"} />
              <AvatarFallback>
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">
                {user.displayName || "Chat"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {messages.length > 0 ? "Active now" : "No messages yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-muted-foreground">
                Start a new conversation...
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === user.uid ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-xl ${
                    msg.senderId === user.uid
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === user.uid 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}>
                    {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
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
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </ProtectedRoute>
  );
}