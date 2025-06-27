"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, writeBatch, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import  ProtectedRoute  from "@/components/ProtectedRoute";
import  AppNavbar  from "@/components/Navbar";
import { Send, Loader2 } from "lucide-react";

type Message = {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: any;
  read: boolean;
};

type User = {
  uid: string;
  displayName: string;
  photoURL?: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchRecipient = async () => {
      if (!userId || typeof userId !== "string") return;
      const docSnap = await getDoc(doc(firestore, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecipient({
          uid: docSnap.id,
          displayName: data.displayName,
          photoURL: data.photoURL || "",
        });
      }
    };
    fetchRecipient();
  }, [userId]);

  useEffect(() => {
    if (!user?.uid || typeof userId !== "string") return;

    const chatQuery = query(
      collection(firestore, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg: any) =>
            (msg.senderId === user.uid && msg.recipientId === userId) ||
            (msg.senderId === userId && msg.recipientId === user.uid)
        );
      setMessages(msgs as Message[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, userId]);

  useEffect(() => {
    const markAsRead = async () => {
      if (!user || !recipient) return;

      const unreadQuery = query(
        collection(firestore, "messages"),
        where("senderId", "==", recipient.uid),
        where("recipientId", "==", user.uid),
        where("read", "==", false)
      );

      const snapshot = await getDocs(unreadQuery);
      const batch = writeBatch(firestore);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    };

    markAsRead();
  }, [user?.uid, recipient]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || typeof userId !== "string") return;

    await addDoc(collection(firestore, "messages"), {
      text: newMessage,
      senderId: user.uid,
      recipientId: userId,
      participants: [user.uid, userId],
      createdAt: serverTimestamp(),
      read: false,
    });

    setNewMessage("");
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-24 max-w-xl mx-auto min-h-screen flex flex-col">
        <div className="py-3 border-b mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient?.photoURL || "/placeholder.png"} />
              <AvatarFallback>
                {recipient?.displayName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{recipient?.displayName || "Loading..."}</h2>
              <p className="text-xs text-muted-foreground">
                {messages.length > 0 ? "Active now" : "No messages yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.senderId === user.uid ? "items-end" : "items-start"} mb-3`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-xl ${
                    msg.senderId === user.uid
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-yellow-500 text-black rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
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
