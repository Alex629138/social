"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { firestore, db } from "@/lib/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

type Post = {
  id: string;
  displayName: string;
  photoURL?: string;
  content: string;
  imageUrl?: string;
  uid: string;
  createdAt?: Timestamp;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const q = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="pt-24 px-4 pb-12 min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <h1 className="text-2xl font-bold mb-6">Community Feed</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Be the first!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="border shadow-sm rounded-xl"
              >
                <CardHeader className="px-6 pt-4 pb-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.photoURL ?? "/placeholder.png"} alt="User Avatar" />
                    <AvatarFallback>
                      {post.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {post.displayName || "Anonymous"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {post.createdAt?.toDate
                        ? post.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-4 space-y-3">
                  <p className="text-sm text-foreground">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      width="700"
                      height="400"
                      src={post.imageUrl}
                      alt="Post Image"
                      className="rounded-md border"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
