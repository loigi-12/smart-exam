import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CreateClassroom from "./Dialog/create-classroom";
import { getClassrooms, getClassSubjects, getStudentSubjects } from "@/services/classroom-services";
import { useAuthStore } from "@/store/authStore";
import JoinClassroom from "./Dialog/join-classroom";
import { FetchUserClassrooms } from "@/services/user-services";
import CreateClass from "../Subject/Dialog/create-class";
import { get, ref } from "firebase/database";
import { database } from "@/lib/firebase";

export default function ClassroomPage() {
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [userClassrooms, setUserClassrooms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);

  const fetchClassSubjects = async () => {
    const subjectIds = await getClassSubjects();

    if (user.documentId && subjectIds?.length) {
      const subjectPromises = subjectIds.map(async (subjectId: string) => {
        const subjectRef = ref(database, `subjects/${subjectId}`);
        const subjectSnapshot = await get(subjectRef);
        return subjectSnapshot.exists() ? { id: subjectId, ...subjectSnapshot.val() } : null;
      });

      const subjects = await Promise.all(subjectPromises);

      setClassSubjects(subjects);
    }
  };

  const fetchStudentSubjects = async () => {
    if (user.role === "student") {
      const subjects = await getStudentSubjects(user.documentId);
      setStudentSubjects(subjects);
    }
  };
  useEffect(() => {
    fetchStudentSubjects();
  }, []);

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  const profSubjects = classSubjects.filter(
    (s) => s !== null && s.createdBy === user.documentId
  ) as any[];

  const studentSubjectIds = studentSubjects.map((s) => s);
  const _studentSubjects = classSubjects.filter((s) => s && studentSubjectIds.includes(s.id));

  const mySubjects = user.role === "professor" ? profSubjects : _studentSubjects;

  const handleCreateClassroom = async (_classroomName: string, _department: string) => {};
  const handleCreateSubject = async (
    _subjectCode: string,
    _subjectName: string,
    _department: string
  ) => {};

  useEffect(() => {
    const unsubscribe = getClassrooms(setClassrooms);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.documentId) {
      const unsubscribe = FetchUserClassrooms(user.documentId, setUserClassrooms);
      return () => unsubscribe();
    }
  }, [user]);

  // const filteredClassrooms = classrooms.filter((room) => {
  //   const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   if (user?.role === "student") {
  //     return matchesSearch && userClassrooms.includes(room.id);
  //   } else if (user?.role === "professor") {
  //     return matchesSearch && userClassrooms.includes(room.id);
  //   } else if (user?.role === "admin") {
  //     return matchesSearch;
  //   }
  //   return false;
  // });

  return (
    <div className="p-2">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="w-full flex flex-1 justify-between sm:w-auto">
            <Input
              placeholder="Search Year Level"
              className="w-full sm:w-64"
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {user?.role === "professor" && <CreateClass onCreate={handleCreateSubject} />}
            {/* {user?.role === "professor" && <CreateSubject onCreate={handleCreateSubject} />} */}
          </div>
          <div>
            {user?.role === "admin" && <CreateClassroom onCreate={handleCreateClassroom} />}
            {user?.role === "student" && <JoinClassroom />}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2">
            <h1 className="font-bold">Class</h1>
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-2 items-center">
            {/* {filteredClassrooms.length === 0 ? (
              <p>No Department found.</p>
            ) : (
              filteredClassrooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/main/classroom/${room.id}/`}
                  state={{ name: room.name }}
                  className="w-full md:w-auto"
                >
                  <Card className="flex items-center w-full sm:w-auto p-4 gap-4 transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#182b5c] dark:bg-[#ff914d] text-white font-bold text-lg">
                      {room.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-base text-center">{room.name}</p>
                  </Card>
                </Link>
              ))
            )} */}

            {classSubjects &&
              mySubjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/main/classroom/${subject.id}/`}
                  state={{ name: subject.name }}
                  className="w-full md:w-auto"
                >
                  <Card className="flex items-center w-full sm:w-auto p-4 gap-4 transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#182b5c] dark:bg-[#ff914d] text-white font-bold text-lg">
                      {subject.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-base text-center">{subject.name}</p>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
