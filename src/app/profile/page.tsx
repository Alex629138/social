"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, UserRoundCog } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useUserData } from "@/hooks/useUserData";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/Navbar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profileData, loading } = useUserData(user?.uid);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ 
    displayName: "", 
    bio: "",
    photoURL: ""
  });

  useEffect(() => {
    if (profileData && user) {
      setEditData({
        displayName: profileData.displayName || user.displayName || "",
        bio: profileData.bio || "",
        photoURL: profileData.photoURL || user.photoURL || ""
      });
    }
  }, [profileData, user]);

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      await updateDoc(doc(db, "users", user.uid), editData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "Recently";
    return timestamp.toDate().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!user || loading) {
    return (
      <ProtectedRoute>
        <AppNavbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </ProtectedRoute>
    );
  }

  // Combine profile data with auth user data
  const userPhotoURL = user.photoURL;
  const userDisplayName = user.displayName;
  const userBio = profileData?.bio || "";

  return (
    <ProtectedRoute>
      <AppNavbar />
      <div className="md:mt-12 mt-6 px-4 pb-12 max-h-screen max-w-3xl mx-auto">
        <div className="w-full space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
              <div className="">
                <div className="flex justify-between items-center">
                  <h1 className="flex items-center text-2xl font-bold">
                    <UserRoundCog className="mr-2 h-6 w-6" />
                    Profile
                  </h1>
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
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                    <AvatarImage src={userPhotoURL || "/placeholder.png"} />
                    <AvatarFallback>
                      {userDisplayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <Input
                      value={editData.displayName}
                      onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                      className="text-center text-xl font-bold"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-center">
                      {userDisplayName || "Anonymous"}
                    </h2>
                  )}
                  
                  <Badge variant="secondary" className="px-3 py-1">
                    @{user.email?.split("@")[0]}
                  </Badge>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground w-full justify-center">
                    <div>
                      <span className="font-bold text-foreground">
                        {profileData?.followers?.length ?? 0}
                      </span>{" "}
                      Followers
                    </div>
                    <div>
                      <span className="font-bold text-foreground">
                        {profileData?.following?.length ?? 0}
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
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      className="min-h-[70px]"
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      {userBio || "No bio yet"}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profileData?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="flex justify-between p-4 bg-muted/30 border-t">
                {isEditing && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}