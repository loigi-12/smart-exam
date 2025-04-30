import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAuthStore } from "@/store/authStore";
import { Button } from "../ui/button";
import { getDepartments } from "@/services/department-services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const { student, professor } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);
  const [editedDepartment, setEditedDepartment] = useState(student?.department || "");
  const [departmentList, setDepartmentList] = useState<{ id: string; name: string }[]>([]);
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const unsubscribe = getDepartments((departments) => {
      setDepartmentList(departments);
    });

    return () => unsubscribe();
  }, []);

  const updateStudentDepartment = async (documentId: string, department: string) => {
    const userRef = ref(database, `users/${documentId}`);
    await update(userRef, { department });
  };

  const handleEditToggle = async () => {
    if (isEditing && student?.id && department) {
      try {
        await updateStudentDepartment(student.id, department);
        setEditedDepartment(department);
        student.department = department;
      } catch (error) {
        console.error("Failed to update department:", error);
      }
    } else {
      setDepartment(student?.department || "");
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[350px] p-6 rounded-lg shadow-lg border-2">
        <div className="text-center border-b pb-2 mb-4">
          <h1 className="text-xl font-bold">Smart Exam</h1>
          <p className="text-sm ">
            {student ? "Student" : professor ? "Professor" : ""} Identification Card
          </p>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#182b5c] dark:bg-[#ff914d] text-white font-bold text-lg">
            {student?.name.charAt(0).toUpperCase() || professor?.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-zinc-400">{student?.studentId}</p>
          <h2 className="text-xl font-semibold">{student?.name || professor?.name}</h2>
        </div>

        {student && (
          <div className="mt-4 text-sm space-y-2 cursor-pointer">
            <p>
              <strong>Department:</strong>
              {isEditing ? (
                <Select value={department || editedDepartment} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentList?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="ml-1" variant="outline">
                  {student?.department}
                </Badge>
              )}
            </p>
            <p>
              <strong>Year:</strong> {student.year}
            </p>
            <p>
              <strong>Program:</strong> {student.program}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>

            {user.role === "admin" && (
              <Button className="w-full text-white" onClick={handleEditToggle}>
                {isEditing ? "Save" : "Edit"}
              </Button>
            )}
          </div>
        )}

        {professor && (
          <div className="mt-4 text-sm space-y-1 cursor-pointer">
            <strong>
              Department:
              {(Array.isArray(professor.department)
                ? professor.department
                : [professor.department]
              )?.map((dept: string, index: number) => (
                <Badge key={index} className="ml-1" variant="outline">
                  {dept}
                </Badge>
              ))}
            </strong>

            <p>
              <strong>Position:</strong> {professor.position}
            </p>
            <p>
              <strong>Role:</strong> {professor.role}
            </p>
            <p>
              <strong>Email:</strong> {professor.email}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
