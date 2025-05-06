import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { Student } from "@/types/students";

export const FetchUserClassrooms = (
  userId: string,
  callback: (classrooms: string[]) => void
) => {
  const userRef = ref(database, `users/${userId}/classrooms`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userClassroomsData = snapshot.val();
      callback(userClassroomsData || []);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};

export const fetchStudentData = (
  callback: (students: Student[]) => void,
  subjectId?: string
) => {
  const userDataRef = ref(database, "users");

  const unsubscribe = onValue(userDataRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();

      const studentArray: Student[] = Object.entries(userData)
        .map(([id, studentData]) => {
          const student = studentData as Record<string, any>;

          return {
            id,
            subjectId: student.subjects || [],
            name: student.name || "",
            email: student.email || "",
            studentId: student.studentId || "",
            department: student.department || "",
            program: student.program || "",
            year: student.year || "",
            role: student.role || "",
          } as Student;
        })
        .filter((student) => {
          const isStudent = student.role === "student";
          const isInClassroom = subjectId
            ? student.subjectId.includes(subjectId)
            : true;
          return isStudent && isInClassroom;
        });

      callback(studentArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};

export const getUsers = (callback: (users: any[]) => void) => {
  const userRef = ref(database, "users");
  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const userArray = Object.entries(userData).map(([id, user]) => ({
        id,
        ...(user as Record<string, any>),
      }));
      callback(userArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};
