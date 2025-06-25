"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, LogOut, Settings, MessageSquare, User } from "lucide-react";
import AppNavbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";



export default function ProfilePage() {
    const [profileData, setProfileData] = useState<any>(null);
    
    const { user } = useAuth();
    useEffect(() => {
      const fetchData = async () => {
        if (!user) return;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      };
      fetchData();
    }, [user]);

    if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <div className="flex justify-center items-start min-h-screen pt-20 pb-10 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-full max-w-2xl space-y-6 px-4">
          {/* Profile Header */}
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
                    <AvatarImage src={user.photoURL ?? "/placeholder.png"} />
                    <AvatarFallback>{user.displayName?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {user.displayName || "Anonymous"}
                      </h2>
                      <p className="text-muted-foreground">
                        @{user.email?.split("@")[0]}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full">
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-500">
                          <LogOut className="h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              
              <span>Email: {user.email}</span>
              <Separator className="my-4" />
              <span>Joined: {profileData?.joined ?? "recently"}</span>
              <Separator className="my-4" />

              <a href={profileData?.website ?? "#"} className="text-sm text-blue-600 hover:underline">
                {profileData?.website ?? "No site"}
              </a>
            </CardContent>
            
            <CardFooter className="flex justify-between p-4 bg-gray-50">
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button className="ml-2">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}