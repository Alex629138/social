"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Bell, BellOff, Heart, MessageCircle, Check, UserRoundPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppNavbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(firestore, "notifications", notificationId), {
      read: true
    });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(
      unreadNotifications.map(n => 
        updateDoc(doc(firestore, "notifications", n.id), { read: true })
    ));
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-0">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="gap-2"
            >
              {showUnreadOnly ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {showUnreadOnly ? "Show all" : "Unread only"}
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-primary hover:text-primary"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {showUnreadOnly 
                ? "No unread notifications" 
                : "No notifications yet"}
            </p>
          </div>
        ) : (
            <div className="gap-10">
            <AnimatePresence>
              {filteredNotifications.map((n) => (
                <Link key={n.id} href={`/posts/${n.postId}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "p-4 rounded-xl transition-all border mb-4",
                      n.read 
                        ? "bg-muted/30 hover:bg-muted/50" 
                        : "bg-white shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={n.fromPhotoURL || "/placeholder.png"} />
                          <AvatarFallback>{n.fromDisplayName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{n.fromDisplayName}</span>{" "}
                            {n.type === "like"
                              ? "liked your post"
                              : n.type === "comment"
                              ? `commented: "${n.content}"`
                              : "followed you"}
                          </p>

                          <div className="flex items-center justify-between mt-0">
                            <p className="text-xs text-muted-foreground">
                              {formatTime(n.createdAt)}
                            </p>
                          </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {n.type === "like" && <Heart className="h-6 w-6 text-red-500 fill-red-500" />}
                        {n.type === "comment" && <MessageCircle className="h-6 w-6 text-blue-500 fill-blue-500" />}
                        {n.type === "follow" && <UserRoundPlus className="h-6 w-6 text-green-500 fill-green-500" />}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </div>          
        )}
      </main>
    </>
  );
}