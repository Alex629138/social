"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function CommentModal({ postId, open, onOpenChange }: {
  postId: string;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(firestore, "posts", postId, "comments"), {
      text: newComment,
      userId: user?.uid,
      userName: user?.displayName,
      userPhoto: user?.photoURL || null,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-60 mb-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded p-2">
                <p className="text-sm font-medium">{comment.userName || "User"}</p>
                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleSubmit}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
