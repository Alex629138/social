import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const getUser = async (uid: string) => {
  try {
    const docRef = doc(firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};
