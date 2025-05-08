import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { getSubjects } from "@/services/subject-services";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getClassroomSubjects, updateClassroomSubjects } from "@/services/classroom-services";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { getBlocks } from "@/services/block-services";
import { getUsers } from "@/services/user-services";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase";

interface Classroom {
  id: string;
  name: string;
  department: string;
}

interface AddSubjectProps {
  classroom: Classroom;
  onSubjectsUpdated: () => void;
}

export default function AddSubject({ classroom, onSubjectsUpdated }: AddSubjectProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjests, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number[]>([]);
  const [currentSubjects, setCurrentSubjects] = useState<number[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    const unsubscribe = getSubjects(setSubjects);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = getBlocks(setBlocks);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = getUsers(setUsers);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCurrentSubjects = async () => {
      const subjects = await getClassroomSubjects(classroom.id);
      setCurrentSubjects(subjects);
    };

    fetchCurrentSubjects();
  }, [classroom.id]);

  const toggleSelection = (id: number) => {
    setSelectedSubject((prev) =>
      prev.includes(id) ? prev.filter((subjectId) => subjectId !== id) : [...prev, id]
    );
  };

  const toggleBlockSelection = (id: number) => {
    setSelectedBlock((prev) =>
      prev.includes(id) ? prev.filter((blockId) => blockId !== id) : [...prev, id]
    );
  };

  const selectAllBlocks = () => {
    if (selectedBlock.length === blocks.length) {
      setSelectedBlock([]);
    } else {
      setSelectedBlock(blocks.map((block) => block.id));
    }
  };

  const toggleUserSelection = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const selectAllUser = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const selectAll = () => {
    const filteredSubjects = subjests.filter(
      (subject) => subject.department === classroom.department
    );
    if (selectedSubject.length === filteredSubjects.length) {
      setSelectedSubject([]);
    } else {
      setSelectedSubject(filteredSubjects.map((subject) => subject.id));
    }
  };

  const addUserToSubjecs = async () => {
    try {
      const updatedSubjects = selectedSubject.filter(
        (subjectId) => !currentSubjects.includes(subjectId)
      );

      console.log("currentSubjects", currentSubjects);
      console.log("updatedSubjects", updatedSubjects);
      console.log("classroom id", classroom.id);

      await updateClassroomSubjects(classroom.id, [...currentSubjects, ...updatedSubjects]);

      const targetUsers = users.filter(
        (user) =>
          selectedUsers.includes(user.id) ||
          selectedBlock.some((blockId) =>
            blocks.some((block) => block.id === blockId && block.name === user.block)
          )
      );
      console.log("selectedBlock", selectedBlock);

      await Promise.all(
        targetUsers.map(async (user) => {
          const existingSubjects = user.subjects || [];
          const newSubjects = [...new Set([...existingSubjects, ...selectedSubject])];

          const userUpdates = {
            [`/users/${user.id}/subjects`]: newSubjects,
          };

          const updatedClassrooms = user.classrooms || [];
          if (!updatedClassrooms.includes(classroom.id)) {
            updatedClassrooms.push(classroom.id); // Add classroom ID
            userUpdates[`/users/${user.id}/classrooms`] = updatedClassrooms;
          }

          await update(ref(database), userUpdates);
        })
      );

      const subjects = await getClassroomSubjects(classroom.id);
      setCurrentSubjects(subjects);
      setSubjects(subjects);

      onSubjectsUpdated();

      toast({
        title: "Success",
        description: "Successfully added subjects and classroom to users",
      });

      setIsDialogOpen(false);
      setSelectedSubject([]);
      setSelectedUsers([]);
      setSelectedBlock([]);
    } catch (error) {
      console.error("Error updating subjects and classrooms for users:", error);
      toast({
        title: "Error",
        description: "Failed to update subjects and classrooms for users",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {user.role === "admin" && (
          <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
            <CirclePlus /> Add Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-7xl">
        <DialogHeader>
          <DialogTitle>Add Info</DialogTitle>
          <DialogDescription>Add info in your department</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <div className="flex items-center justify-between py-2 border-b mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedSubject.length > 0 &&
                    selectedSubject.length ===
                      subjests.filter((subject) => subject.department === classroom.department)
                        .length
                  }
                  onCheckedChange={selectAll}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Department Subjects</p>
            </div>
            <ScrollArea className="rounded-md cursor-pointer">
              <div className="space-y-4">
                {subjests.length === 0 ? (
                  <p className="text-zinc-500">No subject matches the department.</p>
                ) : (
                  subjests
                    .filter((subject) => subject.createdBy === user.documentId)
                    .map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            id={`select-${subject.id}`}
                            checked={selectedSubject.includes(subject.id)}
                            onCheckedChange={() => toggleSelection(subject.id)}
                          />
                          <Avatar>
                            <AvatarFallback>{subject.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{subject.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{subject.department}</Badge>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>
          <div>
            <div className="flex items-center justify-between py-2 border-b mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-user"
                  checked={selectedUsers.length > 0 && selectedUsers.length === users.length}
                  onCheckedChange={selectAllUser}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Roles</p>
            </div>
            <ScrollArea className="rounded-md cursor-pointer">
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-zinc-500">No blocks available for this department.</p>
                ) : (
                  users
                    .filter((user) => user.department == classroom.department)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            id={`select-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{user.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div>
            <div className="flex items-center justify-between py-2 border-b mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-block"
                  checked={selectedBlock.length > 0 && selectedBlock.length === blocks.length}
                  onCheckedChange={selectAllBlocks}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Block</p>
            </div>
            <ScrollArea className="rounded-md cursor-pointer">
              <div className="space-y-4">
                {blocks.length === 0 ? (
                  <p className="text-zinc-500">No blocks available for this department.</p>
                ) : (
                  blocks.map((block) => (
                    <div key={block.id} className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id={`select-${block.id}`}
                          checked={selectedBlock.includes(block.id)}
                          onCheckedChange={() => toggleBlockSelection(block.id)}
                        />
                        <Avatar>
                          <AvatarFallback>{block.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{block.name}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Button className="w-full sm:w-auto text-white" onClick={addUserToSubjecs}>
          Create Subject
        </Button>
      </DialogContent>
    </Dialog>
  );
}
