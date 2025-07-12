"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Loader2, MessageCircleOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

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
    <ProtectedRoute>
      <AppNavbar />
      <main className="pt-12 px-4 max-h-screen">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : post ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-lg rounded-xl">
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
                    className="rounded-md border h-fit w-fit object-fit"
                  />
                )}
                <div className="flex items-center gap-10 mt-5">
                  <p>{post.likes.length} {" "} Likes</p>
                  <p>{post.comments.length} {" "} Comments</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                Comments
              </CardHeader>
              <CardContent>
                {post.comments.length > 0 ? (
                  post.comments.map((comment: any, index: number) => (
                    <div key={index} className="mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.photoURL || "/placeholder.png"} />
                        <AvatarFallback>{comment.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-semibold">{comment.displayName}</p>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center gap-3 text-center py-8 text-muted-foreground">
                    <MessageCircleOff className="h-15 w-15"/>
                    <p className="text-muted-foreground">No comments yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        ) : (
          <p className="text-center text-muted-foreground">Post not found.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
