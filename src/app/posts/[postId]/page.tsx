"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppNavbar from "@/components/Navbar";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      const postRef = doc(firestore, "posts", postId as string);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  return (
    <>
      <AppNavbar />
      <main className="pt-12 px-4 max-h-screen">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : post ? (
          <Card className="max-w-2xl mx-auto border shadow-lg rounded-xl">
            <CardHeader className="flex items-center gap-3 px-6 pt-4 pb-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.photoURL || "/placeholder.png"} />
                <AvatarFallback>{post.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{post.displayName}</h3>
                <p className="text-xs text-muted-foreground">
                  {post.createdAt?.toDate().toLocaleString() || "Just now"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-3 space-y-3">
              <p>{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="rounded-md border max-h-[400px] object-contain"
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-muted-foreground">Post not found.</p>
        )}
      </main>
    </>
  );
}
