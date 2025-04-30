import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import HeaderAdmin from "./header-admin";
import HeaderProfessor from "./header-professor";
import { useAuthStore } from "@/store/authStore";
import { getLatestActivities } from "@/services/dashboard-services";
import { Badge } from "../ui/badge";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<
    Array<{
      examId: string;
      subjectId: string;
      title: string;
      date: string;
      status: "active" | "expired" | "almost-due";
    }>
  >([]);

  useEffect(() => {
    if (user?.documentId) {
      const unsubscribe = getLatestActivities(
        user.documentId,
        user.role,
        (data) => {
          setActivities(data);
        }
      );
      return () => unsubscribe();
    }
  }, [user?.documentId, user?.role]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "expired":
        return "destructive";
      case "almost-due":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {user?.role === "admin" && <HeaderAdmin />}
      {user?.role === "professor" && <HeaderProfessor />}
      <Card>
        <CardHeader>
          <CardTitle>Latest Activities</CardTitle>
          <CardDescription>
            Shows the latest exam updates for your subjects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.examId} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{activity.title}</h3>
                    {activity.status !== "active" && (
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status === "expired" && "Expired"}
                        {activity.status === "almost-due" && "Almost Due"}
                      </Badge>
                    )}
                  </div>{" "}
                  <p className="text-sm text-gray-500">
                    Due date: {activity.date}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
