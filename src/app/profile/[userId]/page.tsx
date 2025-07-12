"use client";
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Mail, MoreVertical, Settings, Edit, UserRoundCog, Zap, Badge } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/Navbar";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const profileId = params?.userId as string;
  const [error, setError] = useState<string | null>(null);

  const { data: profileData, loading } = useUserData(profileId);
  const [ready, setReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    photoURL: "",
  });

  useEffect(() => {
    if (!profileId) {
      setError("No user ID provided");
      return;
    }
    setReady(true);
  }, [profileId]);

  const isOwnProfile = user?.uid === profileId;

  useEffect(() => {
    if (profileData) {
      setEditData({
        displayName: profileData.displayName || "",
        bio: profileData.bio || "",
        photoURL: profileData.photoURL || "",
      });
    }
  }, [profileData]);

  if (!ready || loading) {
    return (
      <ProtectedRoute>
        <AppNavbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppNavbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profileData) {
    return (
      <ProtectedRoute>
        <AppNavbar />
        <div className="flex justify-center items-center h-screen">
          <p>User not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  const handleSave = async () => {
    if (!user?.uid || !isOwnProfile) return;
    try {
      await updateDoc(doc(db, "users", user.uid), editData);
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "Recently";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 max-h-screen max-w-3xl mx-auto">
        <div className="w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center p-6 pb-0">
              <h1 className="flex items-center text-2xl font-bold">
                <UserRoundCog className="mr-2 h-6 w-6" />
                Profile
              </h1>

              {isOwnProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <CardContent className="pt-0">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                  <AvatarImage src={profileData.photoURL || "/placeholder.png"} />
                  <AvatarFallback>
                    {profileData.displayName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <Input
                    value={editData.displayName}
                    onChange={(e) =>
                      setEditData({ ...editData, displayName: e.target.value })
                    }
                    className="text-center text-xl font-bold"
                  />
                ) : (
                  <div className="grid grid-cols-1 justify-center gap-2 sm:flex items-center">
                    <h2 className="text-2xl font-bold text-center flex gap-2 items-center">
                      {profileData.displayName || "Anonymous"}
                    </h2>
                    {profileData.userBadge === "First User" && (
                      <span className="flex items-center gap-1 bg-yellow-600 px-1 py-0.5 rounded-xl w-fit h-fit mx-auto">
                        <p className="text-white text-xs pl-1">First User</p>
                        <Zap className="fill-yellow-200 text-black" />
                      </span>
                    )}
                  </div>
                )}

                <Badge className="px-3 py-1">
                  @{profileData.email?.split("@")[0] || "unknown"}
                </Badge>

                <div className="flex items-center gap-6 text-sm text-muted-foreground w-full justify-center">
                  <div>
                    <span className="font-bold text-foreground">
                      {profileData.followers?.length ?? 0}
                    </span>{" "}
                    Followers
                  </div>
                  <div>
                    <span className="font-bold text-foreground">
                      {profileData.following?.length ?? 0}
                    </span>{" "}
                    Following
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                {isEditing ? (
                  <Textarea
                    placeholder="Tell us about yourself"
                    value={editData.bio}
                    maxLength={50}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="min-h-[70px]"
                  />
                ) : (
                  <p className="text-center text-muted-foreground">
                    {profileData.bio || "No bio yet"}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(profileData.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {isOwnProfile && isEditing && (
              <div className="flex justify-between p-4 bg-muted/30 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
