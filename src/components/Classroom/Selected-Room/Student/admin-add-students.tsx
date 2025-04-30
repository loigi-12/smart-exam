import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ref, onValue } from 'firebase/database'
import { database } from '@/lib/firebase'
import { UserRoundPlus } from 'lucide-react'
import { ref as dbRef, get, update } from 'firebase/database'
import { Classroom } from '@/types/classroom'
import { Subject } from '@/types/subject'

type Props = {
  classroom: Classroom | null
  subject: Subject | null
}

type Student = {
  id: string
  name: string
  year: string
  block: string
  classrooms: string[]
  subjects: string[]
}

export function AdminAddStudentsDialog({ classroom, subject }: Props) {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const usersRef = ref(database, 'users')

    onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) return

        const studentList: Student[] = Object.entries(data)
          .filter(
            ([_, user]: any) =>
              user.role === 'student' &&
              !user.classrooms?.includes(classroom?.id)
          )
          .map(([id, user]: any) => ({
            id,
            name: user.name,
            year: user.year,
            block: user.block,
            classrooms: user.classrooms || [],
            subjects: user.subjects || [],
          }))

        setStudents(studentList)
      },
      (error) => {
        toast({
          title: 'Error',
          description: 'Failed to load students.',
          variant: 'destructive',
        })
        console.error(error)
      }
    )
  }, [])

  const getGroupedOptions = () => {
    const groupSet = new Set<string>()
    students.forEach((student) => {
      groupSet.add(`${student.year}-${student.block}`)
    })
    return Array.from(groupSet)
  }

  const toggleSelectGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    )
  }

  const handleInvite = async () => {
    try {
      const studentsToUpdate = students.filter((student) =>
        selectedGroups.includes(`${student.year}-${student.block}`)
      )

      await Promise.all(
        studentsToUpdate.map(async (student) => {


          const studentClassroomsRef = dbRef(
            database,
            `users/${student.id}/classrooms`
          )
          const snapshot = await get(studentClassroomsRef)
          const existingClassrooms = snapshot.val() || []
          const updatedClassrooms = [
            ...new Set([...existingClassrooms, classroom?.id]),
          ]

          await update(dbRef(database, `users/${student.id}`), {
            classrooms: updatedClassrooms,
          })
          await update(dbRef(database, `users/${student.id}`), {
            subjects: [...new Set([...student.subjects, subject?.id])],
          })
        })
      )

      toast({
        title: 'Success',
        description: 'Students successfully added to the classroom.',
      })

      setSelectedGroups([])
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to add students.',
        variant: 'destructive',
      })
    }
  }

  const groupedOptions = getGroupedOptions()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto flex items-center gap-2 text-white">
          <UserRoundPlus />
          Add Students
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Student Groups</DialogTitle>
          <DialogDescription>
            Choose the year-block groups to invite to this classroom.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {groupedOptions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No available student groups to add.
            </p>
          ) : (
            groupedOptions.map((group) => (
              <div
                key={group}
                className="flex items-center gap-2 p-2 rounded cursor-pointer"
                onClick={() => toggleSelectGroup(group)}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group)}
                  readOnly
                />
                <Label>
                  {(() => {
                    const [year, block] = group.split('-')
                    return ` ${year} | Block: ${block}`
                  })()}
                </Label>
              </div>
            ))
          )}
        </div>
        <Button
          className="mt-4 text-white"
          onClick={handleInvite}
          disabled={selectedGroups.length === 0 || students.length === 0}
        >
          Add Students
        </Button>
      </DialogContent>
    </Dialog>
  )
}
