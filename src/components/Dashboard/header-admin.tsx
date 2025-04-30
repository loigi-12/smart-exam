import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  getTotalUsers,
  getTotalDepartments,
  getTotalSubjects,
  getTotalClassrooms,
} from "@/services/dashboard-services";

export default function HeaderAdmin() {
  const [userCounts, setUserCounts] = useState({
    total: 0,
    students: 0,
    professors: 0,
  });
  const [departmentCount, setDepartmentCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [classroomCount, setClassroomCount] = useState(0);

  useEffect(() => {
    const unsubscribeUsers = getTotalUsers((counts) => {
      setUserCounts(counts);
    });

    const unsubscribeDepartment = getTotalDepartments((departmentCount) => {
      setDepartmentCount(departmentCount);
    });

    const unsubscribeSubject = getTotalSubjects((subjectCount) => {
      setSubjectCount(subjectCount);
    });

    const unsubscribeClassroom = getTotalClassrooms((classroomCount) => {
      setClassroomCount(classroomCount);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeDepartment();
      unsubscribeSubject();
      unsubscribeClassroom();
    };
  }, []);

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Displays total registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">
              {userCounts.total}
            </h1>
            <h1 className="text-sm text-zinc-500">
              {userCounts.students} students and {userCounts.professors}{" "}
              professors
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Departments</CardTitle>
          <CardDescription>Displays total created department</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">
              {departmentCount}
            </h1>
            <h1 className="text-sm text-zinc-500">Departments available</h1>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Subjects</CardTitle>
          <CardDescription>Displays total created subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">
              {subjectCount}
            </h1>
            <h1 className="text-sm text-zinc-500">Subjects available </h1>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Classrooms</CardTitle>
          <CardDescription>Displays total created classroom</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h1 className="text-4xl font-bold text-[#182b5c] dark:text-[#ff914d]">
              {classroomCount}
            </h1>
            <h1 className="text-sm text-zinc-500">Classrooms available</h1>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
