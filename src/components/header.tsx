import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-toggle";
import { getNavData } from "@/constants/nav";
import { useAuthStore } from "@/store/authStore";
import { Link, useLocation } from "react-router-dom";

type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
  items?: NavItem[];
};

export function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
  const navData = getNavData(user?.role);
  const name = location.state?.name;
  const classroomName = location.state?.classroomName;
  const selectedRoom = location.state?.selectedRoom;
  const selectedSubject = location.state?.selectedSubject;
  const source = location.state?.source;

  const currentNavItem = navData.navItems.reduce<NavItem | null>(
    (bestMatch, item) => {
      if (
        location.pathname.startsWith(item.href) &&
        item.href.length > (bestMatch?.href.length || 0)
      ) {
        return item;
      }
      return bestMatch;
    },
    null
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {currentNavItem && (
          <Breadcrumb className="cursor-pointer">
            <BreadcrumbList>
              {source === "classroom" ? (
                <>
                  <BreadcrumbItem>
                    <Link to="/main/classroom" className="hover:underline">
                      Classroom
                    </Link>
                  </BreadcrumbItem>
                  {classroomName && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-zinc-500">
                          {classroomName}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {selectedRoom && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-zinc-500">
                          {selectedRoom}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {selectedSubject && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-zinc-500">
                          {selectedSubject}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              ) : source === "users" ? (
                <BreadcrumbItem>
                  <Link to="/main/users" className="hover:underline">
                    Users
                  </Link>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <Link to={currentNavItem.href} className="hover:underline">
                    {currentNavItem.title}
                  </Link>
                </BreadcrumbItem>
              )}
              {(name || location.pathname.includes("/profile")) && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-zinc-500">
                      {name || "profile"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="ml-auto px-4">
        <ModeToggle />
      </div>
    </header>
  );
}
