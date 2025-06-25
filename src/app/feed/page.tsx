"use client";

import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { firestore, db } from "@/lib/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type Post = {
  id: string;
  displayName: string;
  photoURL?: string;
  content: string;
  imageUrl?: string;
  uid: string;
  createdAt?: Timestamp;
  likes?: string[];
  comments?: {
    uid: string;
    displayName: string;
    photoURL?: string;
    content: string;
    createdAt: Timestamp;
  }[];
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
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

  const toggleLike = async (postId: string, currentLikes: string[] = []) => {
    if (!postId || !user?.uid) return;
  
    const postRef = doc(firestore, "posts", postId);
    const hasLiked = currentLikes?.includes(user.uid);
  
    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };
  
  const addComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !user?.uid) return;
  
    try {
      const postRef = doc(firestore, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          uid: user.uid,
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || null,
          content,
          createdAt: Timestamp.now(),
        }),
      });
  
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="pt-12 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
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
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {post.displayName || "Anonymous"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-4 space-y-3">
                  <p className="text-sm text-foreground">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post Image"
                      className="rounded-md border w-full max-h-[400px] object-cover"
                    />
                  )}
                  
                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm flex gap-1 items-center px-0"
                      onClick={() => toggleLike(post.id, post.likes)}
                    >
                      <Heart className={`w-4 h-4 ${post.likes?.includes(user.uid) ? "text-red-500 fill-red-500" : ""}`} />
                      <span>{post.likes?.length || 0}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm flex gap-1 items-center px-0"
                      onClick={() => setOpenComments(post.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ""} />
                      <AvatarFallback>
                        {user.displayName?.[0]?.toUpperCase() || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addComment(post.id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Comments Modal */}
        <Dialog open={!!openComments} onOpenChange={(open) => !open && setOpenComments(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            {openComments && (
              <>
                <DialogHeader>
                  <DialogTitle>Comments</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {posts.find(p => p.id === openComments)?.comments?.map((comment, i) => (
                    <div key={i} className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.photoURL ?? ""} />
                        <AvatarFallback>
                          {comment.displayName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {comment.displayName || "Anonymous"}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL ?? ""} />
                      <AvatarFallback>
                        {user.displayName?.[0]?.toUpperCase() || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder="Add a comment..."
                      value={commentInputs[openComments] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [openComments]: e.target.value })
                      }
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addComment(openComments);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => addComment(openComments)}
                      disabled={!commentInputs[openComments]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
}