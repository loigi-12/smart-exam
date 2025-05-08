import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Classroom } from "@/types/classroom";
import { Student } from "@/types/students";
import { fetchStudentData } from "@/services/user-services";
import { useNavigate } from "react-router-dom";
import { Subject } from "@/types/subject";

interface StudentTableListProps {
  // classroom: Classroom | null;
  searchQuery: string;
  subject: Subject | null;
}

export default function StudentTableList({
  // classroom,
  searchQuery,
  subject,
}: StudentTableListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!subject) return;

    const unsubscribe = fetchStudentData((filteredStudents) => {
      setStudents(filteredStudents);
    }, subject.id);

    return () => unsubscribe();
  }, [subject]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigateToProfile = (student: Student) => {
    navigate(`/main/subject/${subject?.id}/profile`, {
      state: {
        student,
        source: "subject",
        classroomName: subject?.name,
      },
    });
  };

  return (
    <div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Student ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Department</TableHead>
            <TableHead className="text-center">Block</TableHead>
            <TableHead className="text-center">Program</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <TableRow key={student.id} onClick={() => handleNavigateToProfile(student)}>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.block}</TableCell>
                <TableCell>{student.program}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No students found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
