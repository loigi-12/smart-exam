import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CreateSubject from "./Dialog/create-subject";
import SubjectTable from "./Table/subject-table";

export default function SubjectPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handleCreateSubject = async (
    _subjectCode: string,
    _subjectName: string,
    _department: string
  ) => {};

  return (
    <div className="p-2">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b">
          <div className="w-full sm:w-auto mb-5">
            <Input
              placeholder="Search Subject"
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <CreateSubject onCreate={handleCreateSubject} />
          </div>
        </div>

        <div className="mt-6">
          <SubjectTable searchQuery={searchQuery} />
        </div>
      </Card>
    </div>
  );
}
