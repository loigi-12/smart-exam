import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamTabProps } from "@/types/Exam";
import CreateExamDialog from "./examComponent/createExamDialog";
import DisplayExam from "./examComponent/dispalyExam";
import { useAuthStore } from "@/store/authStore";

export default function ExamTab({ subject, classroom }: ExamTabProps) {
  const { user } = useAuthStore();
  const [createExamDialogOpen, setCreateExamDialogOpen] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Available Exams</h1>
          <div className="flex items-center gap-2">
            {user.role !== "student" && user.role !== "admin" && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setCreateExamDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            )}
          </div>
          <CreateExamDialog
            open={createExamDialogOpen}
            onOpenChange={setCreateExamDialogOpen}
            subject={subject}
          />
        </div>
        <DisplayExam subject={subject} classroom={classroom} />
      </div>

      {/* <div>
        <p>Exam Tab</p>
        <p>ID: {id ?? 'No ID provided'}</p>
        <p>Subject: {subject ? subject.id : 'Loading...'}</p>
        <p>Classroom: {classroom ? classroom.id : 'Loading...'}</p>
      </div> */}
    </div>
  );
}
