import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { database } from "@/lib/firebase";
import { ref, push, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import ExamUpload from "./examUpload";
import { TimePicker } from "@/components/ui/time-picker";

type QuestionType = "multiple-choice" | "identification" | "essay";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer?: string;
  essayScore?: number;
}

interface ExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: { id: string };
  examId?: string;
}

export default function ExamDialog({ open, onOpenChange, subject, examId }: ExamDialogProps) {
  const [examName, setExamName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  // console.log("Exam ID:", examId);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;

      try {
        const examRef = ref(database, `exams/${examId}`);
        const snapshot = await get(examRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          setExamName(data.name || "");
          setStartDate(data.startDate ? new Date(data.startDate) : undefined);
          setDueDate(data.dueDate ? new Date(data.dueDate) : undefined);

          const start = new Date(data.startDate);
          const due = new Date(data.dueDate);
          setStartTime(start);
          setDueTime(due);

          setInstructions(data.instructions || "");
          setQuestions(data.questions || []);
        } else {
          console.warn("No exam found for the given examId.");
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      }
    };

    fetchExamData();
  }, [examId]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      text: "",
      options: type === "multiple-choice" ? ["", "", "", ""] : [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, data: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...data } : q)));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = Array.isArray(q.options) ? [...q.options] : ["", "", "", ""];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };
  const saveExam = async () => {
    if (!examName.trim() || !startDate || !dueDate) {
      alert("Please fill in the exam name and select both start and due dates.");
      return;
    }

    const startDateTime = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startTime ? startTime.getHours() : 0,
      startTime ? startTime.getMinutes() : 0
    );

    const dueDateTime = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
      dueTime ? dueTime.getHours() : 23,
      dueTime ? dueTime.getMinutes() : 59
    );

    if (startDateTime >= dueDateTime) {
      toast({
        title: "Invalid Date Range",
        description: "Start date/time must be before due date/time.",
      });
      return;
    }

    const isValid = questions.every((q) => {
      const isTextValid = q.text.trim() !== "";
      const areOptionsValid =
        q.type !== "multiple-choice" || (q.options?.every((opt) => opt.trim() !== "") && q.answer);
      const isIdentificationValid =
        q.type !== "identification" || (q.answer && q.answer.trim() !== "");

      return isTextValid && areOptionsValid && isIdentificationValid;
    });

    if (!isValid) {
      alert("Some questions are incomplete. Please fill them out.");
      return;
    }

    const examData = {
      name: examName,
      createdAt: new Date().toISOString(),
      startDate: startDateTime.toISOString(),
      dueDate: dueDateTime.toISOString(),
      instructions: instructions || "",
      subjectId: subject.id,
      questions: questions.map((q) => {
        const questionData: any = { ...q };

        if (q.type !== "multiple-choice") {
          delete questionData.options;
        }

        if (
          (q.type === "essay" || q.type === "multiple-choice") &&
          (q.answer === undefined || q.answer === "")
        ) {
          delete questionData.answer;
        }

        if (q.type !== "essay") {
          delete questionData.essayScore;
        } else if (q.essayScore === undefined || q.essayScore === null) {
          delete questionData.essayScore;
        }

        return questionData;
      }),
    };

    // console.log("Exam Data:", examData);

    try {
      const examsRef = ref(database, "exams");
      if (examId) {
        await push(examsRef, examData);
      } else {
        await push(examsRef, examData);
      }

      toast({
        title: examId ? "Exam updated successfully!" : "Exam created successfully!",
        description: "Your exam has been saved.",
        duration: 3000,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "Error saving exam",
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  const resetForm = () => {
    setExamName("");
    setStartDate(undefined);
    setDueDate(undefined);
    setStartTime(null);
    setDueTime(null);
    setInstructions("");
    setQuestions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{examId ? "Edit Exam" : "Create Exam"}</DialogTitle>
          <DialogDescription>
            {examId
              ? "Update the exam details below."
              : "Fill in the details below to create a new exam."}
          </DialogDescription>
        </DialogHeader>

        <ExamUpload
          onUpload={(data) => {
            setExamName(data.name);
            setInstructions(data.instructions || "");
            setQuestions(data.questions);
          }}
        />

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Exam Name</Label>
            <Input
              id="name"
              placeholder="Midterm Exam"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-full space-y-4">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="Select start time"
              />
            </div>

            <div className="w-full space-y-4">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
              <TimePicker value={dueTime} onChange={setDueTime} placeholder="Select due time" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Enter exam instructions here..."
              className="min-h-[100px]"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Questions</h3>
              <Select onValueChange={(value) => addQuestion(value as QuestionType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Question" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="identification">Identification</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No questions added yet. Use the dropdown above to add questions.
              </div>
            )}

            {questions.map((question, index) => (
              <Card key={question.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <Select
                        defaultValue={question.type}
                        onValueChange={(value) =>
                          updateQuestion(question.id, {
                            type: value as QuestionType,
                            options: value === "multiple-choice" ? ["", "", "", ""] : undefined,
                          })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="identification">Identification</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`question-${question.id}`}>Question</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        placeholder="Enter your question here..."
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      />
                    </div>

                    {question.type === "essay" && (
                      <div className="grid gap-2">
                        <Label htmlFor={`essayScore-${question.id}`}>Essay Score</Label>
                        <Input
                          type="number"
                          id={`essayScore-${question.id}`}
                          value={question.essayScore || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              essayScore: parseInt(e.target.value || "0"),
                            })
                          }
                          placeholder="Enter score for this essay"
                        />
                      </div>
                    )}

                    {question.type === "multiple-choice" && (
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                            />
                          </div>
                        ))}
                        <div className="grid gap-2">
                          <Label htmlFor={`answer-${question.id}`}>Correct Answer</Label>
                          <Select
                            onValueChange={(value) =>
                              updateQuestion(question.id, { answer: value })
                            }
                            value={question.answer}
                          >
                            <SelectTrigger id={`answer-${question.id}`}>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options
                                ?.map((opt, idx) => ({ opt, idx }))
                                .filter(({ opt }) => opt.trim() !== "")
                                .map(({ opt, idx }) => (
                                  <SelectItem key={idx} value={opt}>
                                    {String.fromCharCode(65 + idx)}. {opt}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {question.type === "identification" && (
                      <div className="grid gap-2">
                        <Label htmlFor={`answer-${question.id}`}>Correct Answer</Label>
                        <Input
                          id={`answer-${question.id}`}
                          placeholder="Enter the correct answer"
                          value={question.answer || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              answer: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {question.type === "essay" && (
                      <div className="text-sm text-muted-foreground italic">
                        Essay questions will be manually graded.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => addQuestion("multiple-choice")}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Another Question
              </Button>
            )}
          </div>

          {/* Save & Cancel Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="text-white" onClick={saveExam}>
              {examId ? "Save and Clone Exam" : "Create Exam"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
