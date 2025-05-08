import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuthStore } from "@/store/authStore";
import {
  getClassroomsByProfessor,
  getExamsByProfessorSubjects,
} from "@/services/dashboard-services";

export default function HeaderProfessor() {
  const { user } = useAuthStore();
  const [classroomCount, setClassroomCount] = useState(0);
  // const [studentCount, setStudentCount] = useState(0);
  const [examCount, setExamCount] = useState(0);

  useEffect(() => {
    if (user?.documentId) {
      const unsubscribeClassrooms = getClassroomsByProfessor(user.documentId, (data) => {
        setClassroomCount(data.classroomCount);
        // setStudentCount(data.studentCount);
      });

      const unsubscribeExams = getExamsByProfessorSubjects(user.documentId, (count) => {
        setExamCount(count);
      });
      return () => {
        unsubscribeClassrooms();
        unsubscribeExams();
      };
    }
  }, [user?.documentId]);

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Class handled</CardTitle>
          <CardDescription>Displays created classroom count</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">
              {classroomCount}
            </h1>
            <h1 className="text-sm text-zinc-500">Classroom available</h1>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Exam</CardTitle>
          <CardDescription>Displays created exam count</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">{examCount}</h1>
            <h1 className="text-sm text-zinc-500">Exam created</h1>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
