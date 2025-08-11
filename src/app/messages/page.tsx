"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, query, where, collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppNavbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, UserPlus, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCallback } from "react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [groupChats, setGroupChats] = useState<any[]>([]);

  const handleUserSelect = (user: any) => {
    if (!selectedUsers.find((u) => u.uid === user.uid)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  const handleUserRemove = (uid: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.uid !== uid));
  };
  const handleGroupCreate = async () => {
    if (!groupName || selectedUsers.length === 0 || !user) return;
    const memberIds = [user.uid, ...selectedUsers.map(u => u.uid)];
    await addDoc(collection(firestore, "groupChats"), {
      name: groupName,
      members: memberIds,
      admins: [user.uid],
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      invites: selectedUsers.map(u => ({ uid: u.uid, status: "pending" }))
    });
    setGroupModalOpen(false);
    setGroupName("");
    setSelectedUsers([]);
    setSearchUser("");
    setSearchResults([]);
  };
  const handleSearchUser = useCallback(async () => {
    if (!searchUser.trim()) return;
    const q = query(
      collection(firestore, "users"),
      where("displayName", ">=", searchUser),
      where("displayName", "<=", searchUser + '\uf8ff')
    );
    const snap = await getDocs(q);
    const results = snap.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .filter(u => u.uid !== user?.uid && !selectedUsers.find(su => su.uid === u.uid));
    setSearchResults(results);
  }, [searchUser, selectedUsers, user?.uid]);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!user?.uid) return;
    
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
    
      if (userData?.following?.length) {
        const users = await Promise.all(
          userData.following.map(async (uid: string) => {
            const userSnap = await getDoc(doc(firestore, "users", uid));
            const messagesSnap = await getDocs(query(
              collection(firestore, "messages"),
              where("senderId", "==", uid),
              where("recipientId", "==", user.uid),
              where("read", "==", false)
            ));
            return {
              uid,
              ...userSnap.data(),
              unreadCount: messagesSnap.size
            };
          })
        );
        setFollowedUsers(users);
      }
    };
    fetchFollowedUsers();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(firestore, "groupChats"), where("members", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroupChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user?.uid]);

  const filteredUsers = followedUsers.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <AppNavbar />
      <main className="md:mt-12 mt-6 px-4 pb-12 min-h-screen max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="flex items-center text-2xl font-bold mb-2">
            <MessagesSquare className="mr-2 h-6 w-6" />
            Messages
          </h1>
          <Button className="bg-yellow-500 text-black hover:bg-black hover:text-white" onClick={() => setGroupModalOpen(true)}>
            + New Group
          </Button>
        </div>
        {groupChats.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Group Chats</div>
            <div className="space-y-2">
              {groupChats.map(gc => (
                <Card
                  key={gc.id}
                  className="flex justify-center cursor-pointer border-yellow-500 border-2"
                  onClick={() => router.push(`/messages/group/${gc.id}`)}
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-yellow-500 text-black">{gc.name?.[0]?.toUpperCase() || "G"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-md font-medium">{gc.name || "Group"}</h3>
                      <p className="text-xs text-muted-foreground">{gc.members?.length || 0} members</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
              <DialogDescription>Invite users by username or from your following list.</DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Group Name"
              className="mb-2"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <Input
              placeholder="Search by username..."
              className="mb-2"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchUser(); }}
            />
            <div className="mb-2">
              <div className="font-semibold mb-1">Following</div>
              <div className="flex flex-wrap gap-2">
                {followedUsers.map(u => (
                  <Button key={u.uid} size="sm" variant="outline" onClick={() => handleUserSelect(u)} disabled={!!selectedUsers.find(su => su.uid === u.uid)}>
                    {u.displayName}
                  </Button>
                ))}
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Search Results</div>
                <div className="flex flex-wrap gap-2">
                  {searchResults.map(u => (
                    <Button key={u.uid} size="sm" variant="outline" onClick={() => handleUserSelect(u)} disabled={!!selectedUsers.find(su => su.uid === u.uid)}>
                      {u.displayName}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-2">
              <div className="font-semibold mb-1">Selected Members</div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(u => (
                  <Button key={u.uid} size="sm" variant="secondary" onClick={() => handleUserRemove(u.uid)}>
                    {u.displayName} ×
                  </Button>
                ))}
              </div>
            </div>
            <Button className="w-full bg-yellow-500 text-black hover:bg-black hover:text-white" onClick={handleGroupCreate} disabled={!groupName || selectedUsers.length === 0}>
              Create Group
            </Button>
          </DialogContent>
        </Dialog>
        <div className="mb-8">
          <p className="text-muted-foreground mb-6">
            Chat with your friends
          </p>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {followedUsers.length === 0 ? (
              <>
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You&#39;re not following anyone yet.
                </p>
                <Button 
                  className="cursor-pointer bg-yellow-500 text-black hover:bg-black hover:text-white" 
                  onClick={() => router.push('/people')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find People
                </Button>
              </>
            ) : (
              <>
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No matching conversations found
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => (
            <Card
            key={u.uid}
            className="flex justify-center cursor-pointer"
            onClick={() => router.push(`/messages/${u.uid}`)}
            >
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.photoURL || "/placeholder.png"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {u.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-medium">{u.displayName || "User"}</h3>
                  </div>
                </div>
                {u.unreadCount > 0 && (
                  <div className="w-7 h-7 text-center rounded-full bg-yellow-500">
                    <p className="pt-[4px] text-sm">{u.unreadCount > 9 ? "9+" : u.unreadCount}</p>
                  </div>
                )}
              </div>
            </Card>   
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}