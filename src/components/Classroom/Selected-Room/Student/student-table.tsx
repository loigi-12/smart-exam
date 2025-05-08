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
import StudentTableFilter from "@/components/StudentTableFilter";

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
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

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

  // const uniqueBlocks = Array.from(
  //   new Set(
  //     filteredStudents
  //       .filter((student) => student.block && student.block.length > 0)
  //       .flatMap((student) => student.block)
  //   )
  // );

  // const visibleStudents = selectedBlock
  //   ? filteredStudents.filter((s) => s.block.toString() === selectedBlock)
  //   : filteredStudents;

  const uniqueBlocks = Array.from(
    new Set(
      filteredStudents.flatMap((s) => s.block ?? []) // flatten block arrays
    )
  );

  // const uniqueYears = Array.from(
  //   new Set(
  //     filteredStudents
  //       .map((s) => s.year) // assume 'year' is a single value
  //       .filter(Boolean)
  //   )
  // );

  const visibleStudents = filteredStudents.filter((s) => {
    const blockMatch = selectedBlock ? s.block?.includes(selectedBlock) : true;
    const yearMatch = selectedYear ? s.year === selectedYear : true;
    return blockMatch && yearMatch;
  });

  return (
    <div>
      <div className="flex items-center my-2 gap-3">
        <h3>Filter</h3>

        <StudentTableFilter
          label="Block"
          blocks={uniqueBlocks}
          onSelectFilter={(block) => setSelectedBlock(block)}
        />
      </div>

      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">#</TableHead>
            <TableHead className="text-center">Student ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Department</TableHead>
            <TableHead className="text-center">Block</TableHead>
            <TableHead className="text-center">Program</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStudents.length > 0 ? (
            visibleStudents.map((student, index) => (
              <TableRow key={student.id} onClick={() => handleNavigateToProfile(student)}>
                <TableCell>{index + 1}</TableCell>
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
