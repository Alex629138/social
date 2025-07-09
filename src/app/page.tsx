"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FeedPage from "@/components/FeedPage";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("Redirecting to login");
      router.replace("/login");
    }
  }, [user, loading]);

  if (loading || !user) return <div className="flex justify-between items-center"><LoadingAnimation/></div>;

  return <div><FeedPage/></div>;
}
