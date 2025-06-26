"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppNavbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, UserPlus } from "lucide-react";
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
            const snap = await getDoc(doc(firestore, "users", uid));
            return { uid, ...snap.data() };
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
      <main className="pt-12 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          
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
                <Button onClick={() => router.push('/people')}>
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
                className="p-3 flex justify-start gap-4 cursor-pointer"
                onClick={() => router.push(`/messages/${u.uid}`)}
            >
                <p className="flex items-center text-sm text-foreground truncate">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={u.photoURL || "/placeholder.png"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {u.displayName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-md font-medium">{u.displayName || "User"}</span> {" "}
                </p>
            </Card>
              
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}