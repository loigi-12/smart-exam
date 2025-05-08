import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StudentDialog from "./studentDialog";
import { Input } from "../ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
// import { ArrowUpDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
import TableFilter from "../TableFilter";

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  block: string;
  year: string;
  program: string;
  role: "student";
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedYearIndex, setSelectedYearIndex] = useState(-1);

  useEffect(() => {
    const studentsRef = ref(database, "users");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentList = Object.keys(data)
          .filter((key) => data[key].role === "student")
          .map((key) => ({ id: key, ...data[key] }));
        setStudents(studentList);
      }
    });
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueBlocks = Array.from(new Set(filteredStudents.flatMap((s) => s.block ?? []))).sort();
  const uniqueYears = Array.from(
    new Set(filteredStudents.map((s) => s.year).filter(Boolean))
  ).sort();

  const filteredBlocks = selectedYearIndex
    ? uniqueBlocks.filter((b) => b.includes(selectedYearIndex.toString()))
    : uniqueBlocks;

  const visibleStudents = filteredStudents.filter((s) => {
    const blockMatch = selectedBlock ? s.block?.includes(selectedBlock) : true;
    const yearMatch = selectedYear ? s.year?.includes(selectedYear) : true;
    return yearMatch && blockMatch;
  });

  const handleNavigateToProfile = (student: Student) => {
    navigate(`/main/users/profile`, { state: { student, source: "users" } });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search student"
          className="w-40 md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h2 className="hidden sm:block text-sm text-zinc-400 font-normal">Student Management</h2>
        <StudentDialog setStudents={setStudents} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <h3>Filter</h3>

        <TableFilter
          label="Year"
          data={uniqueYears}
          onSelectFilter={(year) => {
            setSelectedYear(year);
            setSelectedYearIndex(uniqueYears.indexOf(year) + 1);
          }}
        />

        {selectedYear && (
          <TableFilter
            label="Block"
            data={filteredBlocks}
            onSelectFilter={(block) => setSelectedBlock(block)}
          />
        )}
      </div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">#</TableHead>
            <TableHead className="text-center">Student ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            {/* <TableHead className="text-center">Email</TableHead> */}
            <TableHead className="text-center">Department</TableHead>
            <TableHead className="text-center">Year</TableHead>
            <TableHead className="text-center">Block</TableHead>
            <TableHead className="text-center">Program</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStudents.map((student, index) => (
            <TableRow
              key={student.id}
              className="border"
              onClick={() => handleNavigateToProfile(student)}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>{student.name}</TableCell>
              {/* <TableCell>{student.email}</TableCell> */}
              <TableCell>
                <Badge variant="secondary">{student.department}</Badge>
              </TableCell>
              <TableCell>{student.year}</TableCell>
              <TableCell>{student.block}</TableCell>
              <TableCell>{student.program}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
