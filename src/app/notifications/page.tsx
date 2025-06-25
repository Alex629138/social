"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppNavbar from "@/components/Navbar";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <>
      <AppNavbar />
      <main className="pt-24 px-4 pb-12 min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Link key={n.id} href={`/posts/${n.postId}`} className="block p-4 bg-white rounded-xl shadow-md hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={n.fromPhotoURL || "/placeholder.png"} />
                    <AvatarFallback>{n.fromDisplayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{n.fromDisplayName}</span>{" "}
                      {n.type === "like" ? "liked your post." : `commented: "${n.content}"`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {n.createdAt?.toDate().toLocaleString() || "Just now"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
