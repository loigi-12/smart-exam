import { useState, useEffect } from "react";
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
import { CirclePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  createClassroom,
  checkIfClassroomExists,
} from "../../../services/classroom-services";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { getDepartments } from "@/services/department-services";

interface CreateClassroomProps {
  onCreate: (classroomName: string, department: string) => void;
}

export default function CreateClassroom({ onCreate }: CreateClassroomProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classroomName, setClassroomName] = useState("");
  const [department, setDepartment] = useState("");
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [departmentList, setDepartmentList] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const unsubscribe = getDepartments((departments) => {
      setDepartmentList(departments);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateClassroom = async () => {
    if (!classroomName || !department) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfClassroomExists(classroomName);

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Classroom Name or Class Code already exists",
        });
        return;
      }

      await createClassroom(classroomName, department, user.documentId);

      toast({
        title: "Success",
        description: "Successfully created classroom",
      });

      onCreate(classroomName, department);

      setClassroomName("");
      setDepartment("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating classroom",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <CirclePlus className="w-5 h-5" />
          Create Department Room
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Year Level</DialogTitle>
          <DialogDescription>
            Create a new year level to start learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classroom-name">Year Level Name</Label>
            <Input
              id="classroom-name"
              placeholder="Enter Year Level Name"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              className="w-full"
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

        <Button
          className="w-full sm:w-auto text-white"
          onClick={handleCreateClassroom}
        >
          Create Classroom
        </Button>
      </DialogContent>
    </Dialog>
  );
}
