import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { PermissionGaurd } from "@/features/authentication/components/PermissionsGaurds";
import { BuildingIcon, LockIcon } from "lucide-react";
import type { ElementType } from "react";
import { Link } from "react-router";

type SidebarItem = {
  title: string;
  path: string;
  permissions: string[];
  icon: ElementType;
};

const items: SidebarItem[] = [
  {
    title: "Customers",
    path: "customers",
    permissions: ["read:customer"],
    icon: BuildingIcon,
  },
  {
    title: "Roles",
    path: "roles",
    permissions: ["read:role"],
    icon: LockIcon,
  },
];

export const Sidebar = () => {
  return (
    <SidebarComponent>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-sm">
            Sula ERP
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, i) => (
                <PermissionGaurd permissions={item.permissions} key={i}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to={item.path}>
                        <item.icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </PermissionGaurd>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};

export { SidebarProvider };
