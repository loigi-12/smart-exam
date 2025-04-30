import { Card } from "../ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth, updatePassword } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function UserSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        toast({
          title: "Success",
          description: "Password updated successfully. Please login again.",
          variant: "default",
        });
        setNewPassword("");
        setConfirmPassword("");
        await auth.signOut();
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "User not authenticated.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{user.name}</div>
            <div>{user.email}</div>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-semibold text-gray-700">
            {user.name[0]}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold">Change Password</h2>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
