import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { useState, useEffect } from "react";

interface EssayQuestionProps {
  question: {
    id: string;
    question: string;
    expectedWordCount: number;
  };
  answer: string;
  onAnswerChange: (answer: string) => void;
  essayScore?: number;
}

export default function EssayQuestion({
  question,
  answer,
  onAnswerChange,
  essayScore,
}: EssayQuestionProps) {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [answer]);

  function disableCopyPaste(inputId: string): void {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener("copy", (e: ClipboardEvent) => {
        e.preventDefault();
        console.log("Copy blocked");
      });

      input.addEventListener("paste", (e: ClipboardEvent) => {
        e.preventDefault();
        console.log("Paste blocked");
      });

      // Optional: block cut as well
      input.addEventListener("cut", (e: ClipboardEvent) => {
        e.preventDefault();
        console.log("Cut blocked");
      });
    } else {
      console.warn(`Element with id "${inputId}" not found.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Question:</h2>
          <p>{question.question}</p>
          <p className="text-sm text-muted-foreground">
            Expected word count: approximately {question.expectedWordCount} words
          </p>
        </div>
        <div className="w-32">
          <Label htmlFor="score-input">Overall Score</Label>
          <Input
            id="score-input"
            type="number"
            min="0"
            step="1"
            value={essayScore ?? "0"}
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="essay-answer">Your Answer</Label>
        <Textarea
          id="essay-answer"
          placeholder="Write your essay here..."
          className="min-h-[200px]"
          value={answer}
          onChange={(e) => {
            onAnswerChange(e.target.value);
            disableCopyPaste("essay-answer");
          }}
        />
        <div className="text-sm text-muted-foreground text-right">
          Word count: {wordCount} / {question.expectedWordCount}
          {wordCount > 0 && wordCount < question.expectedWordCount * 0.8 && (
            <span className="text-amber-500 ml-2">
              (Consider writing more to meet the expected word count)
            </span>
          )}
          {wordCount >= question.expectedWordCount * 0.8 &&
            wordCount <= question.expectedWordCount * 1.2 && (
              <span className="text-green-500 ml-2">(Good length)</span>
            )}
          {wordCount > question.expectedWordCount * 1.2 && (
            <span className="text-amber-500 ml-2">(Consider being more concise)</span>
          )}
        </div>
      </div>
    </div>
  );
}
