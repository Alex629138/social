"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, LogOut, Settings, MessageSquare, User, Mail, Calendar, Link, Share2 } from "lucide-react";
import AppNavbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    website: ""
  });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setEditData({
          displayName: data.displayName || user.displayName || "",
          bio: data.bio || "",
          website: data.website || ""
        });
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), editData);
      setProfileData({ ...profileData, ...editData });
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

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <div className="flex justify-center items-start max-h-screen pt-12 bg-gradient-to-b from-muted/10 to-background">
        <div className="w-full max-w-2xl space-y-6 px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="border-none px-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex">
                    <User className="mr-2"/>
                    Profile
                  </h2>
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
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-500"
                        onClick={() => router.push('/logout')}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                    <AvatarImage src={user.photoURL ?? "/placeholder.png"} />
                    <AvatarFallback>
                      {user.displayName?.[0]?.toUpperCase() ?? "U"}
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
                      {profileData?.displayName || user.displayName || "Anonymous"}
                    </h2>
                  )}
                  
                  <Badge variant="secondary" className="px-3 py-1">
                    @{user.email?.split("@")[0]}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      placeholder="Tell us about yourself"
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      {profileData?.bio || "No bio yet"}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profileData?.joinedAt)}</span>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <Input
                          placeholder="Your website"
                          value={editData.website}
                          onChange={(e) => setEditData({...editData, website: e.target.value})}
                        />
                      </div>
                    ) : profileData?.website ? (
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profileData.website}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between p-4 bg-muted/30 border-t">
                {isEditing ? (
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
                ) : (
                  <>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Button>
                      <Button 
                        variant="default" 
                        className="gap-2"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}