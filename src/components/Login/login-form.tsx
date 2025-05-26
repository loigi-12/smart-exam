import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, database } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const createUserIfNotExists = async (user: any, isGoogleSignIn: boolean = false) => {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      setUser({ ...userData, documentId: user.uid });
      return userData;
    } else {
      const newUserData = {
        email: user.email,
        name: user.displayName || "New User",
        role: isGoogleSignIn ? "student" : "", // set role only for Google users
        createdAt: new Date().toISOString(),
      };
      await set(userRef, newUserData);
      setUser({ ...newUserData, documentId: user.uid });
      return newUserData;
    }
  };

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = await createUserIfNotExists(user);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });

      setEmail("");
      setPassword("");
      navigate("/main");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Invalid credentials or network issue.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = await createUserIfNotExists(user, true); // true = isGoogleSignIn

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });

      navigate("/main");
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
          <form className="p-6 md:p-8" onSubmit={handleEmailPasswordSignIn}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">Login to your account</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full text-white">
                Login
              </Button>
              <div className="flex items-center justify-center">
                <span className="text-sm text-muted-foreground">or</span>
              </div>
              <Button type="button" variant="outline" onClick={handleGoogleSignIn}>
                Sign in with Google
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-zinc-300 dark:bg-slate-200 md:block">
            <img
              src="/logo.png"
              alt="Image"
              className="absolute inset-0 m-auto h-4/5 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
