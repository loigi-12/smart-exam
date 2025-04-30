import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface IdentificationQuestionProps {
  question: {
    id: string
    question: string
  }
  answer: string
  onAnswerChange: (answer: string) => void
}

export default function IdentificationQuestion({ question, answer, onAnswerChange }: IdentificationQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Question:</h2>
        <p>{question.question}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="identification-answer">Your Answer</Label>
        <Input
          id="identification-answer"
          placeholder="Type your answer here"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      </div>
    </div>
  )
}

