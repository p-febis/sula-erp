import { Outlet, useLocation } from "react-router";
import {
  Sidebar,
  SidebarProvider,
} from "@/features/dashboard/components/Sidebar";
import { AuthenticationProvider } from "@/features/authentication/components/AuthenticationProvider";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/Spinner";

export const DashBoardLayout = () => {
  const location = useLocation();

  return (
    <AuthenticationProvider>
      <SidebarProvider>
        <Sidebar />
        <div className="w-full">
          <ErrorBoundary
            fallback={<>An error has occured</>}
            key={location.pathname}
          >
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
        <Toaster richColors />
      </SidebarProvider>
    </AuthenticationProvider>
  );
};
