import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "./firebaseUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { UserRoundPlus } from "lucide-react";

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

interface Department {
  uid: string;
  name: string;
}
interface Block {
  uid: string;
  name: string;
}

export default function StudentDialog({}: {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    department: "",
    block: "",
    year: "",
    program: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const departmentRef = ref(database, "departments");
    onValue(departmentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentList = Object.keys(data).map((uid) => ({
          uid,
          name: data[uid].name,
        }));
        setDepartments(departmentList);
      }
    });

    const blocksRef = ref(database, "blocks");
    onValue(blocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const blocksList = Object.keys(data).map((uid) => ({
          uid,
          name: data[uid].name,
        }));
        setBlocks(blocksList);
      }
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleYearSelect = (year: string) => {
    setNewStudent((prev) => ({ ...prev, year }));
  };

  const handleDepartmentSelect = (department: string) => {
    setNewStudent((prev) => ({ ...prev, department }));
  };

  const handleBlockSelect = (block: string) => {
    setNewStudent((prev) => ({ ...prev, block }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, uid } = await registerUser(
        newStudent.email,
        newStudent.password,
        {
          name: newStudent.name,
          email: newStudent.email,
          studentId: newStudent.studentId,
          department: newStudent.department,
          block: newStudent.block,
          year: newStudent.year,
          program: newStudent.program,
          role: "student",
        }
      );

      if (success && uid) {
        setNewStudent({
          name: "",
          email: "",
          password: "",
          studentId: "",
          department: "",
          block: "",
          year: "",
          program: "",
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error registering student:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white">
          <UserRoundPlus /> Create Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the details to register a new student.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {["name", "email", "password", "studentId", "program"].map(
              (field) => (
                <div
                  key={field}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={field} className="text-right">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type={field === "password" ? "password" : "text"}
                    value={newStudent[field as keyof typeof newStudent]}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              )
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Block</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-left col-span-3"
                  >
                    {newStudent.block || "Select Block"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Select Block</DropdownMenuLabel>
                  {blocks.map((block) => (
                    <DropdownMenuItem
                      key={block.uid}
                      onClick={() => handleBlockSelect(block.name)}
                    >
                      {block.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Department Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Department</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-left col-span-3"
                  >
                    {newStudent.department || "Select Department"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Select Department</DropdownMenuLabel>
                  {departments.map((dept) => (
                    <DropdownMenuItem
                      key={dept.uid}
                      onClick={() => handleDepartmentSelect(dept.name)}
                    >
                      {dept.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Year Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Year</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-left col-span-3"
                  >
                    {newStudent.year || "Select Year"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Select Year</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleYearSelect("1st Year")}
                  >
                    1st Year
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleYearSelect("2nd Year")}
                  >
                    2nd Year
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleYearSelect("3rd Year")}
                  >
                    3rd Year
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleYearSelect("4th Year")}
                  >
                    4th Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="text-white">
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
