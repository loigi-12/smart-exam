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
import { Copy, ExternalLink } from "lucide-react";
import { Subject } from "@/types/subject";
import { useToast } from "@/hooks/use-toast";
import { addInviteCode } from "@/services/classroom-services";

interface InviteStudentDialogProps {
  subject: Subject | null;
}

export default function InviteStudentDialogNew({ subject }: InviteStudentDialogProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const hasExistingInviteCode = !!subject?.inviteCode;
  const codeToUse = hasExistingInviteCode ? subject?.inviteCode : inviteCode;

  const generateRandomString = (length: number) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789[]{}";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCode = async () => {
    if (subject?.name) {
      const code = `${subject.name.substring(0, 4).toUpperCase()}-${generateRandomString(6)}`;
      setInviteCode(code);

      await addInviteCode(subject.id, code);
    }
  };

  const handleCopyClipboard = () => {
    if (!codeToUse) return;

    navigator.clipboard
      .writeText(codeToUse)
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
          <DialogDescription>Invite a student to this subject</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invitation Code</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              {!hasExistingInviteCode && !inviteCode && (
                <Button onClick={handleGenerateCode}>Generate</Button>
              )}
              <Input
                id="invite-code"
                value={codeToUse || ""}
                readOnly
                disabled
                className="w-full"
              />
              <Button variant="outline" onClick={handleCopyClipboard} disabled={!codeToUse}>
                <Copy />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
