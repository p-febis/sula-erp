import { Outlet } from "react-router";
import {
  Sidebar,
  SidebarProvider,
} from "@/features/dashboard/components/Sidebar";
import { AuthenticationProvider } from "@/features/authentication/components/AuthenticationProvider";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "@/components/ui/sonner";

export const DashBoardLayout = () => {
  return (
    <AuthenticationProvider>
      <SidebarProvider>
        <Sidebar />
        <div className="w-full">
          <ErrorBoundary fallback={<>An error has occured</>}>
            <Suspense fallback={<>Loading...</>}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
        <Toaster richColors />
      </SidebarProvider>
    </AuthenticationProvider>
  );
};
