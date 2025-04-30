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
import { auth, database } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRoundPlus } from "lucide-react";

interface Professor {
  id: string;
  name: string;
  email: string;
  department: string[];
  position: string;
  role: "professor";
}

interface Department {
  uid: string;
  name: string;
}

export default function ProfessorDialog({}: {
  setProfessors: React.Dispatch<React.SetStateAction<Professor[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    email: "",
    password: "",
    department: [] as string[],
    position: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments from Firebase
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProfessor((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentToggle = (deptName: string) => {
    setNewProfessor((prev) => {
      const updatedDepartments = prev.department.includes(deptName)
        ? prev.department.filter((d) => d !== deptName)
        : [...prev.department, deptName];

      return { ...prev, department: updatedDepartments };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newProfessor.email,
        newProfessor.password
      );
      const uid = userCredential.user.uid;

      await set(ref(database, `users/${uid}`), {
        name: newProfessor.name,
        email: newProfessor.email,
        department: newProfessor.department, // Stored as an array
        position: newProfessor.position,
        role: "professor",
      });

      setNewProfessor({
        name: "",
        email: "",
        password: "",
        department: [],
        position: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error registering professor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white">
          <UserRoundPlus /> Create Professor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Professor</DialogTitle>
            <DialogDescription>
              Fill in the details to register a new professor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {["name", "email", "password", "position"].map((field) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                <Input
                  id={field}
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  value={newProfessor[field as keyof typeof newProfessor]}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            ))}

            {/* Department Checkboxes */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">Department</Label>
              <div className="col-span-3 space-y-2">
                {departments.map((dept) => (
                  <div key={dept.uid} className="flex items-center space-x-2">
                    <Checkbox
                      id={dept.uid}
                      checked={newProfessor.department.includes(dept.name)}
                      onCheckedChange={() => handleDepartmentToggle(dept.name)}
                    />
                    <Label htmlFor={dept.uid}>{dept.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="text-white">
              {loading ? "Adding..." : "Add Professor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
