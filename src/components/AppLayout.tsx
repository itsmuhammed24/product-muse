import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[240px] min-h-screen">
        <div className="px-10 py-8 max-w-[960px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
