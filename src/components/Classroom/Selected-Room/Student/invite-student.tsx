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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { Classroom } from "@/types/classroom";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

interface InviteStudentDialogProps {
  classroom: Classroom | null;
}

export default function InviteStudentDialog({ classroom }: InviteStudentDialogProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopyClipboard = () => {
    if (classroom) {
      navigator.clipboard
        .writeText(classroom.inviteCode)
        .then(() => {
          toast({
            title: "Success",
            description: "Invitation code copied to clipboard!",
          });

          setIsDialogOpen(false);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <ExternalLink /> Invite Student
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Student</DialogTitle>
          <DialogDescription>Invite a student in this subject</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invitation Code</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="invite-code"
                value={classroom ? classroom.inviteCode : ""}
                readOnly
                disabled
                className="w-full"
              />
              <Button variant="outline" onClick={handleCopyClipboard}>
                <Copy />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
