import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkIfDepartmentExists, createDepartment } from "@/services/department-services";

interface CreateDepartmentProps {
  onCreate: (departmentCode: string, departmentName: string) => void;
}

export default function CreateDepartment({ onCreate }: CreateDepartmentProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const handleCreateDepartment = async () => {
    if (!departmentCode || !departmentName) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfDepartmentExists(departmentCode, departmentName);

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Department Code or Department Name already exists",
        });
        return;
      }

      await createDepartment(departmentCode, departmentName);
      toast({
        title: "Success",
        description: "Successfully created department",
      });

      onCreate(departmentCode, departmentName);

      setDepartmentCode("");
      setDepartmentName("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating department",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <CirclePlus /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>Create a new department to start learning</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-code">Department Code</Label>
            <Input
              id="department-code"
              placeholder="Enter department code"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-name">Department Name</Label>
            <Input
              id="department-name"
              placeholder="Enter department name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
            />
          </div>
        </div>

        <Button className="w-full sm:w-auto text-white" onClick={handleCreateDepartment}>
          Add Department
        </Button>
      </DialogContent>
    </Dialog>
  );
}
