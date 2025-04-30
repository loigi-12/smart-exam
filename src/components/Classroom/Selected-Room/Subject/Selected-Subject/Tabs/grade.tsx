import { useState, useEffect } from 'react'
import type { Subject } from '@/types/subject'
import { useAuthStore } from '@/store/authStore'
import { ref, get } from 'firebase/database'
import { database } from '@/lib/firebase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Trophy } from 'lucide-react'
import ExamViewDialog from './Dialog/exam-dialog'
import { Classroom } from '@/types/classroom'

interface GradeTabProps {
  subject: Subject | null
  classroom: Classroom | null
}

export default function GradeTab({ subject, classroom }: GradeTabProps) {
  const { user } = useAuthStore()
  const userId = user.documentId
  const [examResults, setExamResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!subject) return

    const fetchExamResults = async () => {
      try {
        const userExamsRef = ref(database, 'userExams')
        const usersRef = ref(database, 'users')
        const [examsSnapshot, usersSnapshot] = await Promise.all([
          get(userExamsRef),
          get(usersRef),
        ])

        const examsData = examsSnapshot.val()
        const usersData = usersSnapshot.val()
        const filteredResults = []

        for (const examId in examsData) {
          const exam = examsData[examId]
          if (exam.subjectId === subject.id) {
            const users = exam.users

            if (user.role === 'professor' || user.role === 'admin') {
              const examUserList = Array.isArray(users)
                ? users
                : users
                ? Object.entries(users).map(([id, data]: [string, any]) => ({
                    ...data,
                    id,
                  }))
                : []

              examUserList.forEach((userExam: any) => {
                const totalQuestions = userExam?.totalQuestions || 0
                const userIdForThisExam =
                  userExam.id || userExam.userId || userExam.documentId
                const userInfo = usersData?.[userIdForThisExam]
                const userName = userInfo?.name || 'Unknown'

                filteredResults.push({
                  subjectId: subject.id,
                  examId,
                  name: exam.name,
                  score: userExam.score,
                  totalQuestions,
                  percentage:
                    totalQuestions > 0
                      ? (userExam.score / totalQuestions) * 100
                      : 0,
                  answers: userExam?.answers || {},
                  userExamId: userIdForThisExam,
                  userName, // 🆕 Add user's name
                })
              })
            } else {
              let userExam = null
              if (Array.isArray(users)) {
                userExam = users.find((user: any) => user.id === userId)
              } else {
                userExam = users[userId]
              }

              if (userExam) {
                const totalQuestions = userExam?.totalQuestions || 0
                const userAnswers = userExam?.answers || {}
                const userInfo = usersData?.[userId]
                const userName = userInfo?.name || 'Unknown'

                filteredResults.push({
                  subjectId: subject.id,
                  examId,
                  name: exam.name,
                  score: userExam.score,
                  totalQuestions,
                  percentage:
                    totalQuestions > 0
                      ? (userExam.score / totalQuestions) * 100
                      : 0,
                  answers: userAnswers,
                  userExamId: userId,
                  userName,
                })
              }
            }
          }
        }

        setExamResults(filteredResults)
        console.log('Filtered results with names:', filteredResults)
      } catch (error) {
        console.error('Error fetching user exam results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExamResults()
  }, [subject, userId])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return 'default'
    if (percentage >= 60) return 'secondary'
    return 'destructive'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleRowClick = (examResult: any) => {
    setSelectedExam(examResult)
    setIsDialogOpen(true)
    console.log('Selected exam:', examResult)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">
              {subject?.name} Exam Results
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Your performance across {examResults.length} exam
            {examResults.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total Questions
                </TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {examResults
    .filter(result => {
      if (user.role === 'student') {
        return result.userExamId === userId
      }
      return true // professors and admins see all
    })
    .map((result, index) => {
      const percentage =
        result.totalQuestions > 0
          ? (result.score / result.totalQuestions) * 100
          : 0
      const formattedPercentage = Math.round(percentage)

      return (
        <TableRow
          key={index}
          onClick={() => handleRowClick(result)}
          className="cursor-pointer"
        >
          <TableCell className="font-medium">
            {result.userName}
          </TableCell>
          <TableCell className="font-medium">{result.name}</TableCell>
          <TableCell className={getScoreColor(percentage)}>
            <div className="flex items-center gap-2">
              {result.score}/{result.totalQuestions}
              {percentage >= 80 && (
                <Trophy className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {result.totalQuestions}
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Badge variant={getScoreBadge(percentage)}>
                  {formattedPercentage}%
                </Badge>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          </TableCell>
        </TableRow>
      )
    })}
</TableBody>

          </Table>
        </CardContent>
      </Card>
      <ExamViewDialog
        selectedExam={selectedExam}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        classroom={classroom}
      />
    </>
  )
}
