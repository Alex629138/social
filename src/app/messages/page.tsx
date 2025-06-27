"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppNavbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, UserPlus, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MessagesPage() {
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!user?.uid) return;
    
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
    
      if (userData?.following?.length) {
        const users = await Promise.all(
          userData.following.map(async (uid: string) => {
            const userSnap = await getDoc(doc(firestore, "users", uid));
            const messagesSnap = await getDocs(query(
              collection(firestore, "messages"),
              where("senderId", "==", uid),
              where("recipientId", "==", user.uid),
              where("read", "==", false)
            ));
            return {
              uid,
              ...userSnap.data(),
              unreadCount: messagesSnap.size
            };
          })
        );
        setFollowedUsers(users);
      }
    };
    fetchFollowedUsers();
  }, [user]);

  const filteredUsers = followedUsers.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="flex items-center text-2xl font-bold mb-2">
            <MessagesSquare className="mr-2 h-6 w-6" />
            Messages
          </h1>
          <p className="text-muted-foreground mb-6">
            Chat with your friends
          </p>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {followedUsers.length === 0 ? (
              <>
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You&#39;re not following anyone yet.
                </p>
                <Button 
                  className="cursor-pointer bg-yellow-500 text-black hover:bg-black hover:text-white" 
                  onClick={() => router.push('/people')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find People
                </Button>
              </>
            ) : (
              <>
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No matching conversations found
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => (
            <Card
            key={u.uid}
            className="flex justify-center cursor-pointer"
            onClick={() => router.push(`/messages/${u.uid}`)}
            >
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.photoURL || "/placeholder.png"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {u.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-medium">{u.displayName || "User"}</h3>
                  </div>
                </div>
                {u.unreadCount > 0 && (
                  <div className="w-7 h-7 text-center rounded-full bg-yellow-500">
                    <p className="pt-[4px] text-sm">{u.unreadCount > 9 ? "9+" : u.unreadCount}</p>
                  </div>
                )}
              </div>
            </Card>   
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}