import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubjects } from "@/services/subject-services";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectTableProps {
  searchQuery: string;
}

export default function SubjectTable({ searchQuery }: SubjectTableProps) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sortByName, setSortByName] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const unsubscribe = getSubjects(setSubjects);
    return () => unsubscribe();
  }, []);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSubjects = sortByName
    ? [...filteredSubjects].sort((a, b) => {
        if (sortByName === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      })
    : filteredSubjects;

  return (
    <div>
      <Button
        variant="outline"
        className="mb-3"
        onClick={() =>
          setSortByName((prev) => (prev === "asc" ? "desc" : "asc"))
        }
      >
        Sort by: Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Subject Code</TableHead>
            <TableHead className="text-center">Subject Name</TableHead>
            <TableHead className="text-center">Department</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSubjects.length === 0 ? (
            <div className="p-4">
              <p className="text-zinc-500">No subject found.</p>
            </div>
          ) : (
            sortedSubjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.department}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
