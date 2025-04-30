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
import ProfessorDialog from "./ProfessorDialog";
import { Input } from "../ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Professor {
  id: string;
  name: string;
  email: string;
  department: string[];
  position: string;
  role: "professor";
}

export default function ProfessorManagement() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [sortByName, setSortByName] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const usersRef = ref(database, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const professorList = Object.keys(data)
          .filter((key) => data[key].role === "professor")
          .map((key) => ({ id: key, ...data[key] }));
        setProfessors(professorList);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredProfessors = professors.filter((professor) =>
    professor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProfessors = sortByName
    ? [...filteredProfessors].sort((a, b) => {
        if (sortByName === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      })
    : filteredProfessors;

  const handleNavigateToProfile = (professor: Professor) => {
    navigate(`/main/users/profile`, { state: { professor, source: "users" } });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search professor"
          className="w-40 md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h2 className="hidden sm:block text-sm text-zinc-400 font-normal">
          Professor Management
        </h2>
        <ProfessorDialog setProfessors={setProfessors} />
      </div>
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() =>
            setSortByName((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          Sort by: Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Department</TableHead>
            <TableHead className="text-center">Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProfessors?.map((professor) => (
            <TableRow
              key={professor.id}
              onClick={() => handleNavigateToProfile(professor)}
            >
              <TableCell>{professor.name}</TableCell>
              <TableCell>{professor.email}</TableCell>
              <TableCell className="flex flex-wrap justify-center gap-1">
                {(Array.isArray(professor.department) ? professor.department : [professor.department])?.map((dept, index) => (
                  <Badge key={index} variant="secondary">
                    {dept}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>{professor.position}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
