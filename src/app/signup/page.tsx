"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { saveUserToFirestore } from "@/lib/saveUserToFirestore";
import { BsFacebook, BsGoogle } from "react-icons/bs";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserToFirestore(user);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  };

  // const handleFacebookLogin = () => {
  //   const provider = new FacebookAuthProvider();
  //   handleSocialLogin(provider);
  // };

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden bg-white z-10">
        <CardHeader className="space-y-1 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Join {" "}
            <span className="text-black">Feed</span>
            <span className="text-yellow-500">Link</span>
          </h2>
          <p className="text-sm text-center text-gray-500">
            Connect with your Google account
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 p-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md flex items-center justify-center">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-yellow-500 hover:bg-black hover:text-white cursor-pointer"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <BsGoogle/>
                  Continue with Google
                </>
              )}
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              className="w-full bg-yellow-500 hover:bg-black hover:text-white cursor-pointer"
              onClick={handleFacebookLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <BsFacebook/>
                  Continue with Facebook
                </>
              )}
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}