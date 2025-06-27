"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, provider, storage } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, UserPlus,LogIn,Eye,EyeOff,Loader2} from "lucide-react";
import { saveUserToFirestore } from "@/lib/saveUserToFirestore";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      await saveUserToFirestore(user);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
  
      let photoURL = "";
  
      if (profilePic) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePic);
        photoURL = await getDownloadURL(storageRef);
      }
  
      await saveUserToFirestore({
        ...user,
        displayName,
        photoURL,
      });
  
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 pt-3">
          <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
          <p className="text-sm text-center text-gray-500">
            Get started with your new account
          </p>
        </CardHeader>
        
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4 p-6">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center">
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                Display Name
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Display Name..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Use at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Picture (optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
              />
            </div>


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Image src="/google-icon.svg" alt="Google" className="h-4 w-4 mr-2" width="1" height="1"/>
                  Sign up with Google
                </>
              )}
            </Button>

          </CardContent>
        </form>

        <CardFooter className="p-6 pt-0">
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium flex items-center justify-center"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}