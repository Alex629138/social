"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, LogIn, UserPlus,Eye,EyeOff,Loader2} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { saveUserToFirestore } from "@/lib/saveUserToFirestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 p-6 pb-2">
          <h2 className="text-2xl font-bold text-center text-gray-800">Welcome back</h2>
          <p className="text-sm text-center text-gray-500">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 p-6">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center">
                <span>{error}</span>
              </div>
            )}
            
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
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
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
                    <Image
                        width="2"
                        height="2"
                        src="/google-icon.svg"
                        alt="Google"
                        className="h-4 w-4 mr-2"
                    />
                    Continue with Google
                    </>
                )}
            </Button>

          </CardContent>
        </form>

        <CardFooter className="p-6 pt-0">
          <p className="text-sm text-center text-gray-500">
            Don&#39;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium flex items-center justify-center"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}