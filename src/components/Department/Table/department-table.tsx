import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartments } from "@/services/department-services";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface DepartmentTableProps {
  searchQuery: string;
}

export default function DepartmentTable({ searchQuery }: DepartmentTableProps) {
  const [departments, setDepartment] = useState<any[]>([]);
  const [sortByName, setSortByName] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const unsubscribe = getDepartments(setDepartment);
    return () => unsubscribe();
  }, []);

  const filteredDepartment = departments.filter((department) =>
    department.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDepartments = sortByName
    ? [...filteredDepartment].sort((a, b) => {
        if (sortByName === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      })
    : filteredDepartment;

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
            <TableHead className="text-center">Department Code</TableHead>
            <TableHead className="text-center">Department Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDepartments.length === 0 ? (
            <div className="p-4">
              <p className="text-zinc-500">No department found.</p>
            </div>
          ) : (
            sortedDepartments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.code}</TableCell>
                <TableCell>{department.name}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
