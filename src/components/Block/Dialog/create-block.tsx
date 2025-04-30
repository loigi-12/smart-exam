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
import {
  checkIfBlockExists,
  createBlock,
} from "@/services/block-services";

interface CreateBlockProps {
  onCreate: (blockName: string) => void;
}

export default function CreateBlock({ onCreate }: CreateBlockProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [blockName, setblockName] = useState("");

  const handleCreateBlock = async () => {
    if ( !blockName) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfBlockExists(
        blockName
      );

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Block Name already exists",
        });
        return;
      }

      await createBlock(blockName);
      toast({
        title: "Success",
        description: "Successfully created block",
      });

      onCreate(blockName);

      setblockName("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating block",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <CirclePlus /> Create Block
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Block</DialogTitle>
          <DialogDescription>
            Create a new Block to start learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="block-name">Block Name</Label>
            <Input
              id="block-name"
              placeholder="Enter block name"
              value={blockName}
              onChange={(e) => setblockName(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full sm:w-auto text-white"
          onClick={handleCreateBlock}
        >
          Create Block
        </Button>
      </DialogContent>
    </Dialog>
  );
}
