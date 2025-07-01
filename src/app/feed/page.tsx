"use client";

import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, collection, doc, addDoc, getDoc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { firestore, db } from "@/lib/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, Send, RadioTower, Edit, Sparkles, PencilOff, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

type Post = {
  id: string;
  displayName: string;
  badge: string;
  userBadge: string;
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
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, { displayName: string; photoURL?: string }>>({});
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postData);
      setLoading(false);
      
      // Fetch author data for all comments
      fetchCommentAuthors(postData);
    });
    
    return () => unsubscribe();
  }, []);

  const fetchCommentAuthors = async (posts: Post[]) => {
    const authorIds = new Set<string>();
    posts.forEach(post => {
      post.comments?.forEach(comment => {
        authorIds.add(comment.uid);
      });
    });

    const authors: Record<string, { displayName: string; photoURL?: string }> = {};
    for (const uid of Array.from(authorIds)) {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          authors[uid] = {
            displayName: userDoc.data().displayName || "Anonymous",
            photoURL: userDoc.data().photoURL
          };
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    setCommentAuthors(authors);
  };

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

  const notifyUser = async ({
    userId,
    type, 
    postId,
    fromUser,
    content = ""
  }: {
    userId: string;
    type: "like" | "comment";
    postId: string;
    fromUser: { uid: string; displayName: string; photoURL: string };
    content?: string;
  }) => {
    if (userId === fromUser.uid) return; 
  
    await addDoc(collection(firestore, "notifications"), {
      userId,
      type,
      postId,
      fromUserId: fromUser.uid,
      fromDisplayName: fromUser.displayName,
      fromPhotoURL: fromUser.photoURL,
      content,
      createdAt: serverTimestamp(),
      read: false
    });
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
        <div className="flex justify-between flex-wrap">
          <div>
            <h1 className="flex gap-2 items-center text-2xl font-bold mb-2 lg:mb-0">
              <RadioTower className="h-6 w-6"/>
              Community Feed
            </h1>
            <p className="text-muted-foreground mb-2">
              See what your friends are posting
            </p>
          </div>
          <Button className="border bg-white text-black hover:bg-yellow-500 transition-colors mb-6 lg:mb-0">
            <Edit/>
            <Link href="/create-post">
              Create Post
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <PencilOff className="h-10 w-10"/>
            <p className="text-muted-foreground">No posts yet. Be the first!</p>
            <Button className="border text-black hover:text-white bg-yellow-500 mt-10 transition-colors animate-bounce">
            <Edit/>
            <Link href="/create-post">
              Make your first post
            </Link>
          </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className={index == posts.length - 1 ? "border-4 border-yellow-500 bg-yellow-100 shadow-2xl scale-[1.02]" : "border shadow-sm rounded-xl"}
              >
                <CardHeader className="px-6 flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.photoURL ?? "/placeholder.png"} alt="User Avatar" />
                    <AvatarFallback>
                      {post.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center flex-wrap gap-1 sm:gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {post.displayName || "Anonymous"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    {post.userBadge == "First User" &&
                      <span className="text-xs flex items-center gap-2 bg-yellow-600 px-2 rounded-xl text-white py-0.5 h-fit w-fit">
                      {post.userBadge}
                      <BadgeCheck className="fill-yellow-200 text-yellow-950"/>
                    </span>
                    }
                    {post.badge == "First Post" &&
                      <span className="text-xs flex items-center gap-2 bg-yellow-600 px-2 rounded-xl text-white py-0.5 h-fit w-fit">
                      {post.badge}
                      <BadgeCheck className="fill-yellow-200 text-yellow-950"/>
                    </span>
                    }
                  </div>
                </CardHeader>

                <CardContent className="px-6 space-y-3">
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
                      onClick={() => {
                        toggleLike(post.id, post.likes);
                        notifyUser({
                          userId: post.uid,
                          type: "like",
                          postId: post.id,
                          fromUser: {
                            uid: user.uid,
                            displayName: user.displayName || "Anonymous",
                            photoURL: user.photoURL || "",
                          },
                        });
                      }}
                    >
                      <Sparkles className={`w-4 h-4 ${post.likes?.includes(user.uid) ? "text-yellow-500 fill-yellow-500" : ""}`} />
                      <span>{post.likes?.length || 0}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm flex gap-1 items-center"
                      onClick={() => setOpenComments(post.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? "/placeholder.png"} />
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
                      className="flex-1 border border-black"
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
                      className="bg-yellow-500 hover:bg-primary hover:text-white"
                      onClick={async () => {
                        await addComment(post.id);
                        const content = commentInputs[post.id]?.trim();
                        if (content) {
                          await notifyUser({
                            userId: post.uid,
                            type: "comment",
                            postId: post.id,
                            fromUser: {
                              uid: user.uid,
                              displayName: user.displayName || "Anonymous",
                              photoURL: user.photoURL || "",
                            },
                            content,
                          });
                        }
                      }}
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
                  {posts.find(p => p.id === openComments)?.comments?.map((comment, i) => {
                    const author = commentAuthors[comment.uid] || {
                      displayName: comment.displayName || "Anonymous",
                      photoURL: comment.photoURL
                    };
                    
                    return (
                      <div key={i} className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={author.photoURL ?? "/placeholder.png"} />
                          <AvatarFallback>
                            {author.displayName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {author.displayName}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  
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
                      variant="ghost"
                      className="bg-yellow-500 hover:bg-primary hover:text-white"
                      onClick={async () => {
                        const content = commentInputs[openComments]?.trim();
                        if (!content || !user?.uid) return;

                        await addComment(openComments); 

                        await notifyUser({
                          userId: posts.find(p => p.id === openComments)?.uid || "",
                          type: "comment",
                          postId: openComments,
                          fromUser: {
                            uid: user.uid,
                            displayName: user.displayName || "Anonymous",
                            photoURL: user.photoURL || "",
                          },
                          content,
                        });
                      }}
                      disabled={!commentInputs[openComments]?.trim()}
                    >
                      <Send className="w-4 h-4 text-black hover:text-white" />
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