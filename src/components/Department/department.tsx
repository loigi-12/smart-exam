import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CreateDepartment from "./Dialog/create-department";
import DepartmentTable from "./Table/department-table";

export default function DepartmentPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handleCreateDepartment = async (
    _departmentCode: string,
    _departmentName: string
  ) => {};

  return (
    <div className="p-2">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b">
          <div className="w-full sm:w-auto mb-5">
            <Input
              placeholder="Search department"
              className="w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <CreateDepartment onCreate={handleCreateDepartment} />
          </div>
        </div>

        <div className="mt-6">
          <DepartmentTable searchQuery={searchQuery} />
        </div>
      </Card>
    </div>
  );
}
