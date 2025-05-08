import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getClassrooms } from "../../../services/classroom-services";
import { Card } from "@/components/ui/card";
import SubjectTab from "./Subject/subject";
// import StudentTab from "./Student/student";

export default function SelectedClassroom() {
  const { id } = useParams();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState("subject");

  useEffect(() => {
    const unsubscribe = getClassrooms(setClassrooms);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (id && classrooms.length > 0) {
      const classroom = classrooms.find((classroom) => classroom.id === id);
      setSelectedClassroom(classroom || null);
    }
  }, [id, classrooms]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center border-b">
        <h1 className="text-muted-foreground font-light">
          {selectedClassroom ? `${selectedClassroom.department}` : "Loading..."}
        </h1>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-5"></Tabs>
      </div>

      <div className="mt-2">
        <Tabs defaultValue="subject" className="w-full">
          <TabsContent value="subject">
            <Card className="p-6">
              {selectedTab === "subject" &&
                (selectedClassroom ? (
                  <SubjectTab classroom={selectedClassroom} />
                ) : (
                  <p>Loading data...</p>
                ))}
              {/* {selectedTab === "student" && (
                <StudentTab classroom={selectedClassroom} />
              )} */}
              {/* {selectedTab === "settings" && "Change your password here.1"} */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
