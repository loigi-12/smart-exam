"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultipleChoiceQuestion from "./multiple-choice";
import IdentificationQuestion from "./identification";
import EssayQuestion from "./essay";
import { ref, get, set } from "firebase/database";
import { database } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Question } from "@/types/question";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { getEssayFeedback } from "@/lib/getEssayFeedback";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExamInterfaceProps {
  examId: string;
  onExamSubmit: () => void;
  subject: any;
}
export default function ExamInterface({ examId, onExamSubmit, subject }: ExamInterfaceProps) {
  const [examTitle, setExamTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  // const [feedbackText, setFeedbackText] = useState<string | null>("");
  const [feedbackText] = useState<string>("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examRef = ref(database, `exams/${examId}`);
        const snapshot = await get(examRef);
        if (snapshot.exists()) {
          const data = snapshot.val();

          const start = new Date();
          const end = new Date(data.dueDate);

          const totalSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

          const formattedQuestions: Question[] = (data.questions || []).map(
            (q: any, index: number) => ({
              id: index.toString(),
              type: q.type,
              question: q.text,
              correctAnswer: q.answer || "",
              options: q.options || [],
              essayScore: q.essayScore || 0,
            })
          );

          setExamTitle(data.name);
          setInstructions(data.instructions || "No instructions provided.");
          setDueDate(data.dueDate || "");
          setTimeLimit(totalSeconds);
          setRemainingTime(totalSeconds);
          setQuestions(formattedQuestions);
        } else {
          setExamTitle("Exam Not Found");
          setInstructions("");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLimit <= 0) return;

    if (remainingTime <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, timeLimit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isTimeUp) {
      handleSubmitExam();
      toast({
        title: "Time's Up!",
        description: "Your exam has been automatically submitted.",
        duration: 5000,
      });
    }
  }, [isTimeUp]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!user?.documentId) {
      console.error("User not authenticated");
      return;
    }

    setSubmitting(true);

    const userId = user.documentId;
    let calculatedScore = 0;
    let totalPossibleScore = 0;

    const enhancedAnswers: Record<string, any> = {};

    for (const q of questions) {
      const userAnswerObj = answers[q.id];
      const userAnswer =
        typeof userAnswerObj === "string" ? userAnswerObj : userAnswerObj?.answer ?? "";

      if (q.type === "essay") {
        totalPossibleScore += q.essayScore || 0;

        if (userAnswer) {
          try {
            const aiFeedback = await getEssayFeedback(q.question, userAnswer);
            const rating = aiFeedback?.rating ?? 0;

            calculatedScore += rating;
            enhancedAnswers[q.id] = {
              answer: userAnswer,
              aiFeedback,
            };
          } catch (err) {
            console.error(`Failed to get AI feedback for essay question ${q.id}:`, err);
            enhancedAnswers[q.id] = {
              answer: userAnswer,
              aiFeedback: {
                rating: 0,
                comment: "AI feedback unavailable.",
              },
            };
          }
        }
      } else {
        totalPossibleScore += 1;

        const correct = q.correctAnswer?.trim().toLowerCase();
        const answer = userAnswer?.trim().toLowerCase();

        if (correct && answer === correct) {
          calculatedScore += 1;
        }

        enhancedAnswers[q.id] = {
          answer: userAnswer,
        };
      }
    }

    const submissionData = {
      score: calculatedScore,
      totalQuestions: totalPossibleScore,
      submittedAt: new Date().toISOString(),
      answers: enhancedAnswers,
      feedback: feedbackText?.trim(),
    };

    const examSubmissionRef = ref(database, `userExams/${examId}`);

    try {
      const examSnapshot = await get(examSubmissionRef);
      let updatedData: any = {
        dueDate,
        instructions,
        name: examTitle,
        subjectId: subject,
        users: {
          [userId]: submissionData,
        },
      };

      if (examSnapshot.exists()) {
        const existingData = examSnapshot.val();
        updatedData = {
          ...existingData,
          users: {
            ...existingData.users,
            [userId]: submissionData,
          },
        };
      }

      await set(examSubmissionRef, updatedData);
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setSubmitting(false);
    }

    onExamSubmit();
    setShowSubmitDialog(false);
    toast({
      title: "Exam Submitted",
      description: "Your exam has been successfully submitted.",
      duration: 3000,
    });
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    switch (question.type) {
      case "multiple-choice":
        return (
          <MultipleChoiceQuestion
            question={question}
            selectedOption={answers[question.id] || ""}
            onSelectOption={(option) => handleAnswer(question.id, option)}
          />
        );
      case "identification":
        return (
          <IdentificationQuestion
            question={question}
            answer={answers[question.id] || ""}
            onAnswerChange={(answer) => handleAnswer(question.id, answer)}
          />
        );
      case "essay":
        return (
          <EssayQuestion
            question={question}
            answer={answers[question.id] || ""}
            onAnswerChange={(answer) => handleAnswer(question.id, answer)}
            essayScore={question.essayScore || 0}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center text-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading exam...</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{examTitle}</h1>
        {timeLimit > 0 && (
          <div className="mb-2 flex flex-col items-center">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-300"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="28"
                  cx="32"
                  cy="32"
                />
                <circle
                  className={`transition-all duration-1000 ${
                    remainingTime <= 10
                      ? "text-red-500"
                      : remainingTime <= 20
                      ? "text-orange-500"
                      : "text-primary"
                  }`}
                  strokeWidth="4"
                  strokeDasharray={Math.PI * 2 * 28}
                  strokeDashoffset={(1 - remainingTime / timeLimit) * Math.PI * 2 * 28}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="28"
                  cx="32"
                  cy="32"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{formatTime(remainingTime)}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground mt-1">Time Remaining</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <Tabs defaultValue="question" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          <TabsContent value="question">{renderQuestion()}</TabsContent>
          <TabsContent value="instructions">
            <p>{instructions}</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          className="text-white"
          onClick={
            currentQuestionIndex === questions.length - 1
              ? () => setShowSubmitDialog(true)
              : goToNextQuestion
          }
        >
          {currentQuestionIndex === questions.length - 1 ? "Submit Exam" : "Next"}
        </Button>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="overflow-auto">
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit the exam? You will not be able to change your answers
              after submission.
            </DialogDescription>
          </DialogHeader>
          {/* <Label htmlFor="feedback" className="block mt-4">
            Feedback
          </Label>
          <Textarea
            id="feedback"
            placeholder="Share your thoughts about the exam..."
            className="mt-1"
            value={feedbackText}
            onChange={(e) => console.log("feedback", e.target.value)}
            // onChange={(e) => setFeedbackText(e.target.value)}
            required
          /> */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitExam} disabled={submitting} className="text-white">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
