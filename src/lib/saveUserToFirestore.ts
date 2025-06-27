import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export const saveUserToFirestore = async (user : any) => {
  if (!user?.uid) return;

  const userRef = doc(firestore, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    followers: [],
    following: [],
    createdAt: new Date(),
  }, { merge: true });
};

