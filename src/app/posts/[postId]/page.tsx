"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Loader2, MessageCircle, MessageCircleOff, Sparkle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

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
      <main className="pt-6 lg:px-4 max-h-screen">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : post ? (
          <section className="grid grid-cols-1 gap-6">
            <Card className="lg:max-w-2xl w-full lg:min-w-xl border mx-auto rounded-none lg:rounded-xl border-none shadow-none">
              <CardHeader className="flex items-center gap-3 px-2 lg:px-4 py-2">
                <Link href={`/profile/${post.uid}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.photoURL || "/placeholder.png"} />
                    <AvatarFallback>{post.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${post.uid}`}>
                    <h3 className="font-semibold">{post.displayName}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {post.createdAt?.toDate().toLocaleString() || "Just now"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-0 lg:px-4 pb-3 space-y-3">
                <div className="px-4">
                  <p>{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="h-fit w-fit object-fit"
                    />
                  )}
                </div>
                <div className="flex items-center gap-10 mt-5 px-4">
                  <p className="flex"><Sparkle className="h-5 w-5 mr-2"/>{post.likes.length}</p>
                  <p className="flex"><MessageCircle className="h-5 w-5 mr-2"/>{post.comments.length}</p>
                </div>
                <div className="border-t border-gray-500">
                  <h2 className="font-semibold text-md my-4 px-4">Comments</h2>
                  {post.comments.length > 0 ? (
                    post.comments.map((comment: any, index: number) => (
                      <div key={index} className="w-full mb-4 bg-muted py-3 rounded-none lg:rounded-xl">
                        <Link href={`/profile/${comment.uid}`}>
                          <div className="flex items-center mb-2 px-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={comment.photoURL || "/placeholder.png"} />
                              <AvatarFallback>{comment.displayName?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <p className="">{comment.displayName}</p>
                          </div>
                        </Link>
                        <div className="ml-3">
                          <p>{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">{comment.createdAt?.toDate().toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col justify-center items-center gap-3 text-center py-8 text-muted-foreground">
                      <MessageCircleOff className="h-15 w-15"/>
                      <p className="text-muted-foreground">No comments yet.</p>
                    </div>
                  )}
                </div>
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
