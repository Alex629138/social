"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { firestore, storage } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Send, ImagePlus, X, Loader2, CirclePlus } from "lucide-react";
import AppNavbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/hooks/useUserData";

export default function Home() {
  const { user } = useAuth();
  const { data: profileData } = useUserData(user?.uid || "");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error("Invalid File", {
          description: "Please upload an image file"
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: "Maximum image size is 5MB"
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        
        let imageUrl = null;

        // Upload image to Firebase Storage if selected
        if (selectedImage) {
          const imageRef = ref(storage, `posts/${user.uid}/${uuidv4()}`);
          await uploadBytes(imageRef, selectedImage);
          imageUrl = await getDownloadURL(imageRef);
        }

        // Save post data to Firestore
        await addDoc(collection(firestore, "posts"), {
          uid: user.uid,
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || null,
          content,
          badge: profileData?.badge || "New Post",
          userBadge: profileData?.userBadge || "New User",
          imageUrl,
          likes: [],
          comments: [],
          createdAt: serverTimestamp(),
        });

        setContent("");
        removeImage();
        resolve("Post published successfully");
      } catch (error) {
        console.error("Error creating post:", error);
        reject(error);
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(promise, {
      loading: 'Publishing your post...',
      success: (data) => {
        return `Post published successfully`;
      },
      error: (error) => {
        return 'Failed to publish post. Please try again.';
      },
    });
  };

  

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 px-4 mt-6 pb-12 min-h-screen max-w-3xl mx-auto">
          <div>
            <h1 className="flex items-center text-2xl font-bold mb-2">
              <CirclePlus className="mr-2 h-6 w-6" />
                Create A Post
            </h1>
            <p className="text-muted-foreground mb-6">
              Share what&#39;s on your mind with the community!
            </p> 
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="flex flex-col">
                <label htmlFor="post-content" className="text-md font-medium text-foreground mb-2">
                  Caption
                </label>
                <Textarea
                  id="post-content"
                  placeholder="What would you like to share..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] max-h-[200px] text-base rounded-lg"
                  required
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {content.length}/500 characters
                  </span>
                </div>
              </div>

              {imagePreview && (
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    width="50"
                    height="30"
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={removeImage}
                    className="absolute cursor-pointer top-2 right-2 text-white bg-primary hover:bg-gray-300"
                  >
                    <X className="h-6 w-6 hover:text-black" />
                  </Button>
                </div>
              )}

              <div className="flex items-center">
                <div className="flex">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <input
                      ref={fileInputRef}
                      title="Upload Image"
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={isSubmitting || !content}
                    className="bg-yellow-500 hover:bg-primary hover:text-white cursor-pointer"
                  >
                    <ImagePlus className="h-6 w-6" />
                    {selectedImage ? "Change" : "Add Image"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !content}
                className="w-full h-11 gap-2 text-base text-black font-medium bg-yellow-500 hover:bg-primary hover:text-white cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6" />
                    Publish Post
                  </>
                )}
              </Button>
            </div>
          </form>
      </main>
    </ProtectedRoute>
  );
}