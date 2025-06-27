"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Loader2, UserRoundPlus, UserRoundCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type UserData = {
  uid: string;
  displayName: string;
  photoURL?: string;
  followers?: string[];
  following?: string[];
  bio?: string;
};

export default function PeoplePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(firestore, "users"));
      const usersList = snapshot.docs
        .map((doc) => doc.data() as UserData)
        .filter((u) => u.uid !== user?.uid);
      setUsers(usersList);
      setFilteredUsers(usersList);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const isFollowing = (targetUser: UserData) =>
    targetUser.followers?.includes(user?.uid || "");

  const handleFollowToggle = async (targetUser: UserData) => {
    if (!user) return;

    setFollowingLoading(targetUser.uid);
    const targetRef = doc(firestore, "users", targetUser.uid);
    const currentRef = doc(firestore, "users", user.uid);
    const isCurrentlyFollowing = isFollowing(targetUser);

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        await updateDoc(targetRef, {
          followers: arrayRemove(user.uid),
        });
        await updateDoc(currentRef, {
          following: arrayRemove(targetUser.uid),
        });
        toast.success(`Unfollowed ${targetUser.displayName}`);
      } else {
        // Follow
        await updateDoc(targetRef, {
          followers: arrayUnion(user.uid),
        });
        await updateDoc(currentRef, {
          following: arrayUnion(targetUser.uid),
        });
        notifyUser({
          userId: targetUser.uid,
          type: "follow",
          fromUser: {
            uid: user.uid,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || "",
          },
        });
        toast.success(`Followed ${targetUser.displayName}`);
      }
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update follow status");
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowingLoading(null);
    }
  };

  const notifyUser = async ({
    userId,
    type, 
    fromUser,
  }: {
    userId: string;
    type: "follow";
    fromUser: { uid: string; displayName: string; photoURL: string };
  }) => {
    if (userId === fromUser.uid) return;
  
    await addDoc(collection(firestore, "notifications"), {
      userId,
      type,
      fromUserId: fromUser.uid,
      fromDisplayName: fromUser.displayName,
      fromPhotoURL: fromUser.photoURL,
      createdAt: serverTimestamp(),
      read: false,
    });
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    const filtered = users.filter((u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 min-h-screen max-w-3xl mx-auto bg-gradient-to-b from-muted/10 to-background">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold mb-2">
            <UserRoundPlus className="h-6 w-6"/>
            Discover People
          </h1>
          <p className="text-muted-foreground mb-6">
            Connect with others in your community
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? "No matching users found" : "No users to display"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((userData) => (
                <motion.div
                  key={userData.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 transition-shadow">
                    <div className="block sm:flex items-center justify-between">
                      <div className="block gap-3">
                      <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userData.photoURL || "/placeholder.png"} />
                          <AvatarFallback>
                            {userData.displayName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{userData.displayName}</p>
                          <div className="flex gap-0 mt-0">
                            {userData.bio && (
                            <p className="text-xs text-muted-foreground self-end">
                              {userData.bio}
                            </p>
                            )}
                          </div>
                        </div>
                      </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isFollowing(userData) ? "outline" : "default"}
                        onClick={() => handleFollowToggle(userData)}
                        disabled={followingLoading === userData.uid}
                        className="sm:w-[120px] cursor-pointer w-full"
                      >
                        {followingLoading === userData.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isFollowing(userData) ? (
                          <>
                            <UserRoundCheck className="h-4 w-4 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserRoundPlus className="h-4 w-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}