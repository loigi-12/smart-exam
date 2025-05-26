import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CirclePlus, Text } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkIfSubjectExists, createSubject } from "@/services/subject-services";
import { getDepartments } from "@/services/department-services";
import { useAuthStore } from "@/store/authStore";

interface CreateSubjectProps {
  onCreate: (subjectCode: string, subjectName: string, department: string) => void;
}

export default function CreateClass({ onCreate }: CreateSubjectProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentList, setDepartmentList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const unsubscribe = getDepartments((departments) => {
      setDepartmentList(departments);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateSubject = async () => {
    if (!subjectCode || !subjectName || !department) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfSubjectExists(subjectName, subjectCode);

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Class Name or Class Code already exists",
        });
        return;
      }

      await createSubject(subjectName, subjectCode, department, user.documentId);
      toast({
        title: "Success",
        description: "Successfully class subject",
      });

      onCreate(subjectCode, subjectName, department);

      setSubjectCode("");
      setSubjectName("");
      setDepartment("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating class",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <CirclePlus /> Create Class
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>Create a new Class to start learning</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-code">Class Code</Label>
            <Input
              id="subject-code"
              placeholder="Enter subject code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-name">Class Name</Label>
            <Input
              id="subject-name"
              placeholder="Enter class name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Department" />
              </SelectTrigger>
              <SelectContent>
                {departmentList.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full sm:w-auto text-white" onClick={handleCreateSubject}>
          Create Class
        </Button>
      </DialogContent>
    </Dialog>
  );
}
