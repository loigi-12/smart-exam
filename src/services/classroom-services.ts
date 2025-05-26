import { ref, set, push, get, onValue, update } from "firebase/database";
import { database } from "@/lib/firebase";

export const createClassroom = (classroomName: string, department: string, userId: string) => {
  const createdAt = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const classroomRef = push(ref(database, "classrooms"));
  return set(classroomRef, {
    name: classroomName,
    department: department,
    createdBy: userId,
    createdAt: createdAt,
  });
};

export const checkIfClassroomExists = async (classroomName: string) => {
  const classroomsRef = ref(database, "classrooms");
  const snapshot = await get(classroomsRef);

  if (snapshot.exists()) {
    const classrooms = snapshot.val();

    return Object.values(classrooms).some((classroom: any) => classroom.name === classroomName);
  }

  return false;
};

export const getClassrooms = (callback: (classrooms: any[]) => void) => {
  const classroomsRef = ref(database, "classrooms");
  const unsubscribe = onValue(classroomsRef, (snapshot) => {
    if (snapshot.exists()) {
      const classroomData = snapshot.val();
      const classroomArray = Object.entries(classroomData).map(([id, classroom]) => ({
        id,
        ...(classroom as Record<string, any>),
      }));
      callback(classroomArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};

export const updateClassroomSubjects = async (classroomId: string, subjectIds: number[]) => {
  const classroomRef = ref(database, `classrooms/${classroomId}`);
  await update(classroomRef, {
    subjects: subjectIds,
  });

  for (const subjectId of subjectIds) {
    const subjectRef = ref(database, `subjects/${subjectId}`);
    const subjectSnapshot = await get(subjectRef);

    if (subjectSnapshot.exists()) {
      const subjectData = subjectSnapshot.val();
      const currentClassroomIds = subjectData.classroomId || [];

      await update(subjectRef, {
        classroomId: [...currentClassroomIds, classroomId],
      });
    } else {
      console.error(`Subject not found for ID: ${subjectId}`);
    }
  }
};

export const getClassroomSubjects = async (classroomId: string) => {
  const classroomRef = ref(database, `classrooms/${classroomId}`);
  const snapshot = await get(classroomRef);
  if (snapshot.exists()) {
    return snapshot.val().subjects || [];
  }
  return [];
};

export const getClassSubjects = async () => {
  const classroomRef = ref(database, `subjects`);
  const snapshot = await get(classroomRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data); // returns ['id1', 'id2', ...]
  }
  return [];
};

export const addInviteCode = async (subjectId: string, code: string) => {
  const classRef = ref(database, `subjects/${subjectId}`);
  await update(classRef, {
    inviteCode: code,
  });
};

export const StudentJoinClassroom = async (inviteCode: string, studentId: string) => {
  const classroomsRef = ref(database, "classrooms");
  const userRef = ref(database, `users/${studentId}`);

  if (!studentId) {
    console.error("Error: studentId is undefined");
    return { success: false, message: "Invalid user ID." };
  }

  try {
    const snapshot = await get(classroomsRef);
    if (snapshot.exists()) {
      let classroomId: string | null = null;
      let students: string[] = [];

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.inviteCode === inviteCode) {
          classroomId = childSnapshot.key;
          students = data.students || [];
        }
      });

      if (!classroomId) {
        return { success: false, message: "Invalid invite code." };
      }

      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        return { success: false, message: "User not found." };
      }

      const userData = userSnapshot.val();
      const userClassrooms = userData.classrooms || [];

      if (students.includes(studentId)) {
        return { success: false, message: "You have already joined this classroom." };
      }

      const updatedStudents = [...students, studentId];

      if (userClassrooms.includes(classroomId)) {
        return { success: false, message: "Classroom already added to user." };
      }

      const updatedUserClassrooms = [...userClassrooms, classroomId];

      await update(ref(database, `classrooms/${classroomId}`), {
        students: updatedStudents,
      });

      await update(userRef, {
        classrooms: updatedUserClassrooms,
      });

      return { success: true, classroomId };
    }

    return { success: false, message: "Invalid invite code." };
  } catch (error) {
    console.error("Error joining classroom:", error);
    return { success: false, message: "Failed to join the classroom." };
  }
};
