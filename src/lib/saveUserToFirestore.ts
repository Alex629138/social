import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export const saveUserToFirestore = async (user: any) => {
  if (!user) return;

  const userRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: new Date(),
    });
  }
};
