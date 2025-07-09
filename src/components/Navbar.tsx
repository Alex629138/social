"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DarkModeButton from "@/components/DarkModeButton";
import { cn } from "@/lib/utils";
import { LogOut, MenuIcon } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const links = [
  { href: "/", label: "Home" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Notifications" },
  { href: "/people", label: "People" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="w-full border px-4 py-3 shadow-sm">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary flex items-center">
          <img
            width="36"
            height="36"
            src="/logo.jpg" 
            alt="Logo" />
          <span className="text-muted">Feed</span>
          <span className="text-yellow-500">Link</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    pathname === href ? "px-3 py-2 bg-muted rounded-md" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {label}
                </Link>
              ))}

              <DarkModeButton />
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? "/placeholder.png"} />
                    <AvatarFallback>
                      {user.displayName?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    <Link href="/signup">
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Placeholder */}
        <div className="md:hidden flex gap-4">
          <DarkModeButton/>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-transparent border">
                <MenuIcon className="h-6 w-6 text-yellow-500"/>
              </Button>
            </DropdownMenuTrigger>
            
              {user ? (
              <DropdownMenuContent className="w-36">
                {links.map(({ href, label }) => (
                  <DropdownMenuItem asChild key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "w-full py-0 rounded-md transition-colors",
                        pathname === href 
                          ? "bg-muted font-medium indent-0 py-1.5" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild className="text-muted-foreground">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-muted-foreground">
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-muted-foreground">
                  <span onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                    <LogOut className="w-4 h-4" />
                      Logout
                  </span>                  
                </DropdownMenuItem>
              </DropdownMenuContent>
              ) : (
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
