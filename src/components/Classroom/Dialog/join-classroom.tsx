import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { StudentJoinClassroom } from "@/services/classroom-services";

export default function JoinClassroom() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async () => {
    if (!inviteCode) {
      toast({
        title: "Error",
        description: "Please enter invitation code.",
      });
      return;
    }

    try {
      const result = await StudentJoinClassroom(inviteCode, user?.documentId);

      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully joined the classroom.",
        });
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      toast({
        title: "Error",
        description: "Failed to join the classroom.",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          Join Classroom
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Classroom</DialogTitle>
          <DialogDescription>
            Join classroom to start learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invitation Code</Label>
            <Input
              id="invite-code"
              placeholder="Invitation code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
        </div>

        <Button className="w-full sm:w-auto text-white" onClick={handleSubmit}>
          Join Classroom
        </Button>
      </DialogContent>
    </Dialog>
  );
}
