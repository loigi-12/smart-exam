import { useState } from "react";
import { Input } from "@/components/ui/input";
import InviteStudentDialog from "./invite-student";
import { Classroom } from "@/types/classroom";
import StudentTableList from "./student-table";
import { useAuthStore } from "@/store/authStore";
import { AddStudentsDialog } from "./add-students";
// import { AdminAddStudentsDialog } from "./admin-add-students";
import { Subject } from "@/types/subject";
import InviteStudentDialogNew from "./invite-student-new";

interface StudentTabProps {
  classroom: Classroom | null;
  subject: Subject | null;
}

export default function StudentTab({ subject, classroom }: StudentTabProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useAuthStore();
  console.log(user.role);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center border-b">
        <div className="w-full sm:w-auto mb-5">
          <Input
            placeholder="Search student name"
            className="w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mb-5 flex gap-5">
          {/* {user.documentId === classroom?.createdBy && (
            <>
              <InviteStudentDialog classroom={classroom} />
            </>
          )} */}

          {user.role === "professor" && (
            <>
              {/* <InviteStudentDialog classroom={classroom} /> */}
              <InviteStudentDialogNew subject={subject} />
            </>
          )}

          {user.role === "admin" && (
            <>
              {/* <AdminAddStudentsDialog classroom={classroom} subject={subject} /> */}
              <AddStudentsDialog classroom={classroom} subject={subject} />
            </>
          )}
        </div>
      </div>

      <div>
        <StudentTableList subject={subject} searchQuery={searchQuery} />
      </div>
    </div>
  );
}
