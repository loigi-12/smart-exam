import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function NavUser({ handleLogout }: { handleLogout: () => void }) {
  const user = useAuthStore((state) => state.user) || {};
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogoutWithClear = () => {
    clearUser();
    handleLogout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <LogOut className="ml-auto" onClick={handleLogoutWithClear} />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
