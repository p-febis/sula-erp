import { Outlet } from "react-router"
import {
  Sidebar,
  SidebarProvider,
} from '@/features/dashboard/components/Sidebar'
import { AuthenticationProvider } from "@/features/authentication/components/AuthenticationProvider"
import { Suspense } from "react"

export const DashBoardLayout = () => {
  return (
      <AuthenticationProvider>
	<SidebarProvider>
	  <Sidebar />
	  <div className="w-full">
	    <Suspense fallback={<>Loading...</>}>
	      <Outlet />
	    </Suspense>
	  </div>
	</SidebarProvider>
      </AuthenticationProvider>
  )
}
