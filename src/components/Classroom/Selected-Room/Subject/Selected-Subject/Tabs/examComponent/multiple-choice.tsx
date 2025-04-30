import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface MultipleChoiceQuestionProps {
  question: {
    id: string
    question: string
    options: string[]
  }
  selectedOption: string
  onSelectOption: (option: string) => void
}

export default function MultipleChoiceQuestion({
  question,
  selectedOption,
  onSelectOption,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Question:</h2>
        <p>{question.question}</p>
      </div>

      <RadioGroup value={selectedOption} onValueChange={onSelectOption} className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

