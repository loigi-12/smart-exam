import { auth, database } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

export async function registerUser(
  email: string,
  password: string,
  userData: Record<string, any>
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await set(ref(database, `users/${uid}`), userData);

    return { success: true, uid };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error };
  }
}
