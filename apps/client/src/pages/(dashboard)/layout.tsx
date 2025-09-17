import { AppSidebar } from "./side-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TopBar } from "./top-bar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
