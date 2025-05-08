import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import CreateClassroom from "./Dialog/create-classroom";
import { getClassrooms } from "@/services/classroom-services";
import { useAuthStore } from "@/store/authStore";
// import JoinClassroom from "./Dialog/join-classroom";
import { FetchUserClassrooms } from "@/services/user-services";

export default function ClassroomPage() {
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [userClassrooms, setUserClassrooms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleCreateClassroom = async (_classroomName: string, _department: string) => {};

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

  const filteredClassrooms = classrooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (user?.role === "student") {
      return matchesSearch && userClassrooms.includes(room.id);
    } else if (user?.role === "professor") {
      return matchesSearch && userClassrooms.includes(room.id);
    } else if (user?.role === "admin") {
      return matchesSearch;
    }
    return false;
  });

  return (
    <div className="p-2">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <Input
              placeholder="Search Year Level"
              className="w-full sm:w-64"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            {/* {user?.role === "admin" ? (
              <JoinClassroom />
            ) : (
              <CreateClassroom onCreate={handleCreateClassroom} />
            )} */}
            {user?.role === "admin" && <CreateClassroom onCreate={handleCreateClassroom} />}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2">
            <h1 className="font-bold">Class</h1>
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-2 items-center">
            {filteredClassrooms.length === 0 ? (
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
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
