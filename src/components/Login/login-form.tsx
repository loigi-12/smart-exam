import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, database } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const documentId = Object.keys(usersData).find(
          (key) => usersData[key].email === user.email
        );

        if (documentId) {
          const userData = { ...usersData[documentId], documentId };

          setUser(userData);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.name}!`,
          });

          navigate("/main");
        } else {
          toast({
            title: "Error",
            description: "No matching user data found in the database.",
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Google sign-in failed.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col gap-6 justify-center">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-balance text-muted-foreground">Sign in with your Google account</p>
            </div>
            <Button onClick={handleGoogleSignIn} className="w-full text-white">
              Sign in with Google
            </Button>
          </div>
          <div className="relative hidden bg-zinc-300 dark:bg-slate-200 md:block">
            <img
              src="/logo.png"
              alt="Image"
              className="absolute inset-0 m-auto h-4/5 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
