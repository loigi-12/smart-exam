import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentManagement from "./studentManagement";
import ProfessorManagement from "./professorManagement";
import { Card } from "../ui/card";

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="professors">Professors</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <StudentManagement />
          </Card>
        </TabsContent>
        <TabsContent value="professors">
          <Card>
            <ProfessorManagement />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
