import { ChangeEvent, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import Papa from 'papaparse'

interface ExamUploadProps {
  onUpload: (data: {
    name: string
    instructions?: string
    questions: any[]
  }) => void
}

export default function ExamUpload({ onUpload }: ExamUploadProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const text = await file.text()
      const parsed = Papa.parse(text, { header: true })
      const rows = parsed.data as any[]

      const metadata = rows.find((row) => row.section === 'meta')
      if (!metadata) throw new Error('Missing metadata')

      const questions = rows
        .filter((row) => row.section === 'question')
        .map((row) => ({
          id: row.id,
          type: row.type,
          text: row.text,
          options: row.options ? row.options.split('|') : undefined,
          answer: row.answer || undefined,
        }))

      const exam = {
        name: metadata.name,
        instructions: metadata.instructions,
        questions,
      }

      if (!exam.name || !Array.isArray(exam.questions)) {
        throw new Error('Invalid exam format')
      }

      setTimeout(() => {
        onUpload(exam)
        toast({
          title: 'Exam data loaded!',
          description: 'Fields populated from uploaded CSV.',
        })
        setLoading(false)
      }, 5000)
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: 'Could not parse or validate the CSV file.',
        variant: 'destructive',
      })
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className='flex justify-between'>
        <label className="font-medium text-sm">Upload Exam CSV Format</label>
        <a href="https://firebasestorage.googleapis.com/v0/b/connectify-8a658.appspot.com/o/Capture.PNG?alt=media&token=e8534269-1739-4dbc-ad4a-115496b6acd0" target="_blank" rel="noopener noreferrer">
          <p className='text-xs text-muted-foreground' style={{ textDecoration: 'underline', color: 'blue' }}>Here is a sample for CSV Format</p>
        </a>
      </div>
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={loading}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <div className="h-4 w-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          Initializing AI for Populating the fields
        </div>
      )}
    </div>
  )
}
