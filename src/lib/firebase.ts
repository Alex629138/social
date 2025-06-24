import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics} from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBjhRGQMUvgbo5y6Uynl1QRHh5-7JoQX-Y",
  authDomain: "marketplace-5e65e.firebaseapp.com",
  projectId: "marketplace-5e65e",
  storageBucket: "marketplace-5e65e.firebasestorage.app",
  messagingSenderId: "671961880626",
  appId: "1:671961880626:web:c6fb8f773189f9ab38042b",
  measurementId: "G-ETQY200EW3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app)
const db = getFirestore(app);
const storage = getStorage(app); 
// const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

  
export { auth, db, storage, provider, firestore };
export default app;