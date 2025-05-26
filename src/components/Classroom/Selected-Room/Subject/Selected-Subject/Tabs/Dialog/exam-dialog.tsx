import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getExamQuestions, getFeedback } from "@/services/exam-view-services";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Classroom } from "@/types/classroom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

interface ExamViewDialogProps {
  selectedExam: {
    examId: string;
    userExamId: string;
    name?: string;
    score?: number;
    totalQuestions?: number;
    percentage?: number;
    answers?: any;
  } | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  classroom: Classroom | null;
}

export default function ExamViewDialog({
  selectedExam,
  isDialogOpen,
  setIsDialogOpen,
}: ExamViewDialogProps) {
  const { user } = useAuthStore();

  const [questions, setQuestions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedExam?.examId) {
        try {
          const fetchedQuestions = await getExamQuestions(selectedExam.examId);
          setQuestions(fetchedQuestions);
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      }
    };

    if (isDialogOpen && selectedExam) {
      fetchQuestions();
    }
  }, [selectedExam, isDialogOpen]);

  useEffect(() => {
    if (selectedExam?.examId && selectedExam?.userExamId) {
      const unsubscribe = getFeedback(
        selectedExam.examId,
        selectedExam.userExamId,
        (newFeedback) => {
          setFeedback(newFeedback);
        }
      );

      return () => unsubscribe();
    }
  }, [selectedExam]);

  const renderQuestionContent = (question: any, index: number) => {
    const userAnswer = selectedExam?.answers?.[index]?.answer || "No answer";
    const aiFeedback = selectedExam?.answers?.[index]?.aiFeedback;

    switch (question.type) {
      case "multiple-choice":
        return (
          <div>
            <RadioGroup value={userAnswer} onValueChange={(value) => console.log(value)}>
              {question.options?.map((option: string, idx: number) => (
                <Card key={idx} className="flex items-center justify-between space-x-2 mt-2 p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option} />
                    <Label>{option}</Label>
                  </div>

                  {String(option).toLowerCase() === String(question.answer).toLowerCase() && (
                    <div className="text-zinc-500 text-xs">
                      {user.role === "professor" ? "Correct Answwer" : ""}
                    </div>
                  )}
                </Card>
              ))}
            </RadioGroup>
          </div>
        );
      case "identification":
        return (
          <div className="mt-2 relative">
            <div className="flex items-center border rounded-xl px-3 py-2">
              <span className="text-black dark:text-white flex-grow">{userAnswer}</span>
              <span className="text-zinc-500 text-xs">
                {user.role === "professor" ? `Correct answer: ${question.answer}` : ""}{" "}
              </span>
            </div>
          </div>
        );

      case "essay":
        return (
          <div className="mt-2">
            <Textarea value={userAnswer} readOnly className="mt-2" />
            {aiFeedback && (
              <div className="mt-4 p-4  rounded-md">
                <Label className="text-lg font-semibold">AI Feedback:</Label>
                <div className="mt-2">
                  <Badge>
                    <p>
                      Rating:{" "}
                      {Math.round((aiFeedback?.rating / 10) * question.essayScore) ||
                        "Not available"}{" "}
                      out of {question.essayScore}
                    </p>
                  </Badge>
                  <p>Comment: {aiFeedback?.comment || "No comment available"}</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  const feedbackRef = useRef(null);
  // const handleSubmitFeedback = ({value}: String) => {
  //   // const feedback = feedbackRef.current?.feedbackText;

  //   console.log("feedback", value);
  //   // if ((selectedExam?.examId && selectedExam?.userExamId, feedback)) {
  //   //   feedbackExam(selectedExam?.examId, selectedExam.userExamId, feedback);
  //   // }
  // };

  const handleSubmitFeedback = () => {
    console.log("feedback", feedbackRef.current);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedExam?.name}</DialogTitle>
          <DialogDescription>Exam name</DialogDescription>
        </DialogHeader>
        {selectedExam ? (
          <div>
            <div className="flex items-center justify-between gap-2 cursor-pointer">
              <Badge variant="outline">
                {selectedExam.score} / {selectedExam.totalQuestions}
              </Badge>
              {selectedExam?.percentage !== undefined && (
                <Badge variant={selectedExam.percentage >= 60 ? "secondary" : "destructive"}>
                  {Math.round(selectedExam.percentage)}%
                </Badge>
              )}
            </div>

            <div className="mt-4">
              {questions.length > 0 ? (
                <ul>
                  {questions.map((question, index) => (
                    <li key={index} className="mt-4">
                      <Label className="text-lg font-semibold">
                        {index + 1}. {question.text}
                      </Label>
                      {renderQuestionContent(question, index)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No questions available.</p>
              )}
            </div>
          </div>
        ) : (
          <p>No exam selected.</p>
        )}

        {feedback ? (
          <div className="mt-6">
            <Label>Feedback:</Label>
            <Card className="mt-2 p-4">
              <p>{feedback}</p>
            </Card>
          </div>
        ) : (
          <>
            <Label htmlFor="feedback" className="block mt-4">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts about the exam..."
              className="mt-1"
              ref={feedbackRef}
              required
            />
            <Button className="" variant="outline" onClick={handleSubmitFeedback}>
              Submit feedback
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
