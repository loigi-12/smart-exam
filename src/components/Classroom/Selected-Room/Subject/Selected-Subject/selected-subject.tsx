import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamTab from "./Tabs/exam";
import GradeTab from "./Tabs/grade";
import { Subject } from "@/types/subject";
import { Classroom } from "@/types/classroom";
import StudentTab from "../../Student/student";

export default function SelectedSubjectInRoom() {
  const { id } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [selectedTab, setSelectedTab] = useState("exam");
  // const [createdByName, setCreatedByName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectAndClassroom = async () => {
      const subjectRef = ref(database, `subjects/${id}`);
      const subjectSnapshot = await get(subjectRef);

      if (subjectSnapshot.exists()) {
        const subjectData = { id, ...subjectSnapshot.val() } as Subject;
        setSubject(subjectData);

        const classroomId = subjectData.classroomId;
        if (!classroomId) {
          console.error("Classroom ID not found in subject data");
          return;
        }

        const targetClassroomId = Array.isArray(classroomId) ? classroomId[0] : classroomId;

        const classroomRef = ref(database, `classrooms/${targetClassroomId}`);
        const classroomSnapshot = await get(classroomRef);

        if (classroomSnapshot.exists()) {
          const classroomData = {
            id: classroomId,
            ...classroomSnapshot.val(),
          } as Classroom;
          setClassroom(classroomData);

          // const userRef = ref(database, `users/${classroomData.createdBy}`);
          // const userSnapshot = await get(userRef);
          // if (userSnapshot.exists()) {
          //   const userData = userSnapshot.val();
          //   setCreatedByName(userData.name);
          // } else {
          //   console.error(`User not found for ID: ${classroomData.createdBy}`);
          // }
        } else {
          console.error(`Classroom not found for ID: ${classroomId}`);
        }
      } else {
        console.error("Subject not found");
      }
    };

    fetchSubjectAndClassroom();
  }, [id]);

  return (
    <div>
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b cursor-pointer">
          <div className="mb-4 flex items-center">
            <p className="text-sm">Subject Name:</p>
            <Badge variant="outline" className="ml-1">
              {subject ? subject.name : "Loading..."}
            </Badge>
          </div>
          <div className="mb-4 flex items-center">
            <p className="text-sm">Subject Code:</p>
            <Badge variant="outline" className="ml-1">
              {subject ? subject.code : "Loading..."}
            </Badge>
          </div>
          <div className="mb-4 flex items-center">
            <p className="text-sm">Subject Department:</p>
            <Badge variant="outline" className="ml-1">
              {subject ? subject.department : "Loading..."}
            </Badge>
          </div>
          {/* <div className="mb-4 flex items-center">
            <p className="text-sm">Professor:</p>
            <Badge variant="outline" className="ml-1">
              {createdByName ? createdByName : "Loading..."}
            </Badge>
          </div> */}
          <div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-5">
              <TabsList className="flex">
                <TabsTrigger value="exam">Exam</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="grade">Grade</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mt-6">
          {selectedTab === "student" && <StudentTab subject={subject} classroom={classroom} />}
          {selectedTab === "exam" && <ExamTab id={id} subject={subject} classroom={classroom} />}
          {selectedTab === "grade" && <GradeTab subject={subject} classroom={classroom} />}
        </div>
      </Card>
    </div>
  );
}
