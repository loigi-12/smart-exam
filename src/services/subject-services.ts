import { ref, set, push, get, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export const createSubject = (
  subjectName: string,
  subjectCode: string,
  department: string,
  createdBy: string
) => {
  const createdAt = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const subjectRef = push(ref(database, "subjects"));
  return set(subjectRef, {
    name: subjectName,
    code: subjectCode,
    department: department,
    createdAt: createdAt,
    createdBy: createdBy,
  });
};

export const checkIfSubjectExists = async (subjectName: string, subjectCode: string) => {
  const subjectsRef = ref(database, "subjects");
  const snapshot = await get(subjectsRef);

  if (snapshot.exists()) {
    const subjects = snapshot.val();

    return Object.values(subjects).some(
      (subjects: any) => subjects.name === subjectName || subjects.code === subjectCode
    );
  }

  return false;
};

export const getSubjects = (callback: (subject: any[]) => void) => {
  const subjectsRef = ref(database, "subjects");

  const unsubscribe = onValue(subjectsRef, (snapshot) => {
    if (snapshot.exists()) {
      const subjectsData = snapshot.val();
      const subjectsArray = Object.entries(subjectsData).map(([id, subject]) => ({
        id,
        ...(subject as Record<string, any>),
      }));
      callback(subjectsArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};

// export const addSubjectToProfessor = async (subjectId: string, professorId: string) => {
//   const subjectRef = ref(database, "subjects");
//   const userRef = ref(database, `users/${professorId}`);

//   if (!professorId) {
//     console.error("Error: professorId is undefined");
//     return { success: false, message: "Invalid user ID." };
//   }

//   try {
//     const snapshot = await get(subjectRef);

//     if (snapshot.exists()) {
//       const userSnapshot = await get(userRef);
//       if (!userSnapshot.exists()) {
//         return { success: false, message: "User not found." };
//       }

//       const userData = userSnapshot.val();
//       const userClassSubject = userData.subjects || [];

//       const updatedUserSbuject = [...userClassSubject, subjectId];

//       await update(userRef, {
//         subjects: updatedUserSbuject,
//       });

//       return { success: true, subjectId };
//     }

//     return { success: false, message: "Invalid subjectId" };
//   } catch (error) {
//     console.error("Error adding subject to prof", error);
//     return { success: false, message: "Failed to add prof subject." };
//   }
// };
