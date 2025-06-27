import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const useUserData = (uid: string | null | undefined) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!!uid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData({ uid, ...docSnap.data() });
        } else {
          setData(null);
        }
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  return { data, loading, error };
};
