import { ref, set, push, get, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export const createDepartment = (
    departmentCode: string,
    departmentName: string
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

    const departmentRef = push(ref(database, "departments"));
    return set(departmentRef, {
        code: departmentCode,
        name: departmentName,
        createdAt: createdAt,
    });
}

export const checkIfDepartmentExists = async (departmentCode: string, departmentName: string) => {
    const departmentRef = ref(database, "departments");
    const snapshot = await get(departmentRef);

    if (snapshot.exists()) {
        const  department = snapshot.val();

        return Object.values(department).some(
            (department: any) => department.code === departmentCode || department.name === departmentName
        )
    }

    return false;
}

export const getDepartments = (callback: (departments: any[]) => void) => {
  const departmentRef = ref(database, "departments");
  const unsubscribe = onValue(departmentRef, (snapshot) => {
    if (snapshot.exists()) {
      const departmentData = snapshot.val();
      const departmentArray = Object.entries(departmentData).map(
        ([id, department]) => ({
          id,
          ...(department as Record<string, any>),
        })
      );
      callback(departmentArray);
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};
