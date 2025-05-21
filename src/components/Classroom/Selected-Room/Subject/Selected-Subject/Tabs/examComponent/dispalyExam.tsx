import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Exam } from "@/types/Exam";
import ConfirmationDialog from "./ConfirmationDialog";
import ExamInterface from "./examInterfaceDialog";
import { Search, CopyCheck, FileDown } from "lucide-react"; // Import the Edit icon
import { Input } from "@/components/ui/input";
import { database } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Classroom } from "@/types/classroom";
import ExamDialog from "./createExamDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { format, isValid } from "date-fns";

interface DisplayExamProps {
  subject: { id: string };
  classroom: Classroom;
}

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  answer?: string;
  essayScore?: number;
}

interface _Exam {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  createdAt: string;
  subjectId: string;
  questions: Question[];
  instructions: string;
}

export default function DisplayExam({ subject, classroom }: DisplayExamProps) {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startExam, setStartExam] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const checkIfSubmitted = async (examId: string) => {
    if (!user?.documentId) return false;
    const userExamRef = ref(database, `userExams/${examId}/users/${user.documentId}`);
    const snapshot = await get(userExamRef);
    return snapshot.exists();
  };
  useEffect(() => {
    if (!subject?.id) return;

    const examsRef = ref(database, "exams");

    const unsubscribe = onValue(examsRef, (snapshot) => {
      if (snapshot.exists()) {
        const examData = snapshot.val();
        const loadedExams: Exam[] = Object.entries(examData)
          .map(([id, data]: [string, any]) => {
            const startDate = new Date(data.startDate);
            const dueDate = new Date(data.dueDate);
            const createdAt = new Date(data.createdAt);

            return {
              id,
              title: data.name,
              startDate: isNaN(startDate.getTime()) ? "" : data.startDate,
              dueDate: isNaN(dueDate.getTime()) ? "" : data.dueDate,
              createdAt: isNaN(createdAt.getTime()) ? "" : data.createdAt,
              subjectId: data.subjectId,
              questions: data.questions,
              instructions: data.instructions,
            };
          })
          .filter((exam) => exam.subjectId === subject.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // newest first

        setExams(loadedExams);
      } else {
        setExams([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [subject?.id]);

  const handleEditExam = (examId: string) => {
    setSelectedExam(examId);
    setEditDialogOpen(true);
  };

  const handleExportExam = (examId: string) => {
    setSelectedExam(examId);

    const exam = exams.find((e) => e.id === examId) as _Exam | undefined;
    if (exam) {
      console.log(exam);
      exportToCSV(exam);
    } else {
      console.error("Exam not found");
    }
  };

  const headers = [
    "section",
    "id",
    "type",
    "text",
    "options",
    "answer",
    "essayScore",
    "name",
    "instructions",
  ];

  function exportToCSV(exam: _Exam, filename = "questions.csv"): void {
    const csvRows: string[] = [headers.join(",")];

    // First row: meta section
    const metaRow = headers.map((header) => {
      if (header === "section") return "meta";
      if (header === "name") return exam.title;
      if (header === "instructions") return exam.instructions;
      return "";
    });
    csvRows.push(metaRow.join(","));

    // Question rows
    exam.questions.forEach((q) => {
      const row = headers.map((header) => {
        let cell: string = "";

        switch (header) {
          case "section":
            cell = "question";
            break;
          case "id":
            cell = q.id;
            break;
          case "type":
            cell = q.type;
            break;
          case "text":
            cell = q.text;
            break;
          case "options":
            cell = q.options?.join("| ") ?? "";
            break;
          case "answer":
            cell = q.answer ?? "";
            break;
          case "essayScore":
            cell = q.essayScore !== undefined ? q.essayScore.toString() : "";
            break;
          case "name":
          case "instructions":
            cell = "";
            break;
        }

        // Escape CSV-sensitive characters
        if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }

        return cell;
      });

      csvRows.push(row.join(","));
    });

    // Create and download CSV file
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // const filteredExams = exams.filter((exam) =>
  //   exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const filteredExams = useMemo(() => {
    return exams
      .filter((exam) => exam.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [exams, searchQuery]);

  const handleConfirmExam = () => {
    setDialogOpen(false);
    setStartExam(true);
  };

  const handleExamSubmitted = () => {
    setStartExam(false);
    setDialogOpen(false);
  };

  const handleExamSelect = async (examId: string) => {
    if (user?.role === "admin" || user?.role === "professor") {
      toast({
        title: "Access Restricted",
        description: "Cannot take or view exams.",
        variant: "destructive",
      });
      return;
    }

    const selected = exams.find((exam) => exam.id === examId);
    if (!selected) return;

    const currentDate = new Date();
    const startDate = new Date(selected.startDate);
    const dueDate = new Date(selected.dueDate);
    if (currentDate < startDate) {
      toast({
        title: "Exam Not Yet Open",
        description: `This exam will be available on ${startDate.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    if (currentDate > dueDate) {
      toast({
        title: "Exam Closed",
        description: `The deadline to take this exam was ${dueDate.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    const alreadySubmitted = await checkIfSubmitted(examId);
    if (alreadySubmitted) {
      toast({
        title: "Exam Already Taken",
        description: "You can only take this exam once.",
        variant: "destructive",
      });
      return;
    }

    setSelectedExam(examId);

    if (user?.documentId === classroom.createdBy) {
      setStartExam(true);
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exams..."
          className="pl-9 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="bg-background border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-5 w-20 bg-muted mt-2" />
                </CardContent>
              </Card>
            ))
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="bg-background border-border cursor-pointer hover:border-primary"
              onClick={() => handleExamSelect(exam.id)}
            >
              <CardContent className="p-4 flex justify-between">
                <div>
                  <h3 className="font-medium text-black dark:text-white">{exam.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Starts:{" "}
                      {exam.startDate && isValid(new Date(exam.startDate))
                        ? format(new Date(exam.startDate), "PPpp")
                        : "Invalid date"}
                    </div>
                    <div>
                      Due:{" "}
                      {exam.dueDate && isValid(new Date(exam.dueDate))
                        ? format(new Date(exam.dueDate), "PPpp")
                        : "Invalid date"}
                    </div>
                  </div>
                </div>
                {user.role === "professor" && (
                  <div className="flex flex-col justify-between gap-2">
                    <CopyCheck
                      className="text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExam(exam.id);
                      }}
                    />
                    <FileDown
                      className="text-green-700 cursor-pointer"
                      onClick={(e) => {
                        handleExportExam(exam.id);
                        e.stopPropagation();
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No exams found.</div>
        )}
      </div>

      <ConfirmationDialog
        examTitle={
          selectedExam ? exams.find((exam) => exam.id === selectedExam)?.title || "this exam" : ""
        }
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmExam}
      />

      {startExam && selectedExam && (
        <Dialog open={startExam} onOpenChange={setStartExam}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <ExamInterface
              examId={selectedExam}
              onExamSubmit={handleExamSubmitted}
              subject={subject.id}
            />
          </DialogContent>
        </Dialog>
      )}

      {editDialogOpen && selectedExam && (
        <ExamDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          examId={selectedExam}
          subject={subject}
        />
      )}
    </div>
  );
}
