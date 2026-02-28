import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[220px] min-h-screen">
        <div className="px-12 py-10 max-w-[920px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
