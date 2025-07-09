"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function CommentDrawer({ postId, open, onOpenChange }: {
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-6">
        <DrawerHeader>
          <DrawerTitle>Comments</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="h-[300px] px-4 mb-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded p-2">
                <p className="text-sm font-medium">{comment.userName || "User"}</p>
                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 px-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleSubmit}>Send</Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
