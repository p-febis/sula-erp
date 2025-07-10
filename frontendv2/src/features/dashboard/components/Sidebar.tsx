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
} from '@/components/ui/sidebar'
import { BuildingIcon } from 'lucide-react'
import type { ElementType } from 'react'
import { Link } from 'react-router'

type SidebarItem = {
  title: string
  path: string
  icon: ElementType
}

const items: SidebarItem[] = [
  {
    title: 'Customers',
    path: 'customers',
    icon: BuildingIcon,
  },
]

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
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  )
}

export { SidebarProvider }
