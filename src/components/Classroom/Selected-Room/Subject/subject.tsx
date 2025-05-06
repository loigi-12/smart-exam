import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { getClassroomSubjects } from "@/services/classroom-services";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AddSubject from "./Dialog/add-subject";
import { Link } from "react-router-dom";
import { getUsers } from "@/services/user-services";
import { useAuthStore } from "@/store/authStore";
import { Subject } from "@/types/subject";

interface Classroom {
  id: string;
  name: string;
  department: string;
  createdBy: string;
}

interface SubjectTabProps {
  classroom: Classroom;
}

export default function SubjectTab({ classroom }: SubjectTabProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [userState, SetUserState] = useState<any>([]);
  const { user } = useAuthStore();

  const [classroomSubjects, setClassroomSubjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchClassroomSubjects = async () => {
    if (classroom.id) {
      const subjectIds = await getClassroomSubjects(classroom.id);

      const subjectPromises = subjectIds.map(async (subjectId: string) => {
        const subjectRef = ref(database, `subjects/${subjectId}`);
        const subjectSnapshot = await get(subjectRef);
        return subjectSnapshot.exists()
          ? { id: subjectId, ...subjectSnapshot.val(), classroom }
          : null;
      });

      const subjects = await Promise.all(subjectPromises);
      setClassroomSubjects(subjects.filter((subject) => subject !== null) as any[]);
    }
  };

  useEffect(() => {
    fetchClassroomSubjects();
  }, [classroom.id]);

  useEffect(() => {
    const unsubscribe = getUsers(setUsers);
    SetUserState(user);
    return () => unsubscribe();
  }, []);

  let filteredSubjects = [];

  if (userState.role === "professor") {
    const matchedUser = users.find((u) => u.id === userState.documentId);
    const subjectIds = matchedUser?.subjects ?? [];

    filteredSubjects = classroomSubjects.filter((subject) => subjectIds.includes(subject.id));
  } else {
    filteredSubjects = classroomSubjects.filter((subject) =>
      subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center border-b">
        <div className="w-full sm:w-auto mb-5">
          <Input
            placeholder="Search Subject"
            className="w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mb-5 ">
          <AddSubject classroom={classroom} onSubjectsUpdated={fetchClassroomSubjects} />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2">
          <h1 className="font-bold">Course Subjects</h1>
        </div>
        <div className="flex flex-col sm:flex-row w-full gap-2 items-center">
          {filteredSubjects.length === 0 ? (
            <p className="text-zinc-500">No Subject found in this department</p>
          ) : (
            filteredSubjects.map((roomSubject) => (
              <Link
                key={roomSubject.id}
                to={`/main/classroom/${classroom.id}/${roomSubject.id}/`}
                state={{
                  classroomCreatedBy: classroom.createdBy,
                  selectedRoom: classroom.name,
                  source: "classroom",
                  selectedSubject: roomSubject.name,
                }}
              >
                <Card className="flex items-center w-full sm:w-auto p-4 gap-4 transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#182b5c] dark:bg-[#ff914d] text-white font-bold text-lg">
                    {roomSubject.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base">{roomSubject.name}</p>
                    <p className="text-xs text-zinc-500">{roomSubject.code}</p>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
