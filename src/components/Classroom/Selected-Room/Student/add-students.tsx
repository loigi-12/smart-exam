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
import { get, ref as dbRef, update } from "firebase/database";
import { Classroom } from '@/types/classroom'
import { Subject } from '@/types/subject'

type Props = {
  classroom : Classroom | null
  subject : Subject | null
}

export function AddStudentsDialog({ classroom, subject }: Props) {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const usersRef = ref(database, 'users')

    onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) return

        const studentList = Object.entries(data)
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const handleInvite = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (studentId) => {
          const userRef = dbRef(database, `users/${studentId}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val() || {};
      
          // Ensure both are flat arrays
          const existingSubjects = Array.isArray(userData.subjects) ? userData.subjects : [];
          const existingClassrooms = Array.isArray(userData.classrooms) ? userData.classrooms : [];
      
          const newSubjects = [...new Set([...existingSubjects, subject?.id])];
          const updatedClassrooms = [...new Set([...existingClassrooms, classroom?.id])];
      
          const updates = {
            [`/users/${studentId}/subjects`]: newSubjects,
            [`/users/${studentId}/classrooms`]: updatedClassrooms,
          };
      
          await update(ref(database), updates);
        })
      );
      
  
      toast({
        title: 'Success',
        description: 'Students successfully added to the subject.',
      });
  
      setSelectedIds([]);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add students.',
        variant: 'destructive',
      });
    }
  };
  

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
          <DialogTitle>
            Select Students to be added to the classroom
          </DialogTitle>
          <DialogDescription>
            Choose the students you want to invite to this classroom.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No available students to add.
            </p>
          ) : (
            students
              .filter((student: any) => !student.subjects?.includes(subject?.id))
              .map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer"
                  onClick={() => toggleSelect(student.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    readOnly
                  />
                  <Label>
                    {student.name} | {student.year} | Block {student.block}
                  </Label>
                </div>
              ))
          )}
        </div>
        <Button
          className="mt-4 text-white"
          onClick={handleInvite}
          disabled={selectedIds.length === 0 || students.length === 0}
        >
          Add Students
        </Button>
      </DialogContent>
    </Dialog>
  )
}
