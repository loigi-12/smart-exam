import {
  Users,
  LayoutDashboard,
  SquareUserRound,
  Notebook,
  BookOpen,
  UserCircle,
} from "lucide-react";

export const getNavData = (role: string) => ({
  navItems: [
    {
      title: "Dashboard",
      href: "/main",
      icon: LayoutDashboard,
      isActive: true,
    },
    ...(role !== "student" && role !== "professor"
      ? [
          {
            title: "Department",
            href: "/main/department",
            icon: Notebook,
          },
        ]
      : []),
    ...(role !== "student" && role !== "professor"
      ? [
          {
            title: "Subject",
            href: "/main/subject",
            icon: BookOpen,
          },
        ]
      : []),
    {
      title: "Classes",
      href: "/main/classroom",
      icon: SquareUserRound,
    },
    ...(role !== "student" && role !== "professor"
      ? [
          {
            title: "Users",
            href: "/main/users",
            icon: Users,
          },
        ]
      : []),
    ...(role !== "student" && role !== "professor"
      ? [
          {
            title: "Block",
            href: "/main/block",
            icon: SquareUserRound,
          },
        ]
      : []),

    {
      title: "User Settings",
      href: "/main/user-settings",
      icon: UserCircle,
    },
  ],
});
