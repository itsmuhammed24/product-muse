import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, ListOrdered, FileText } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/feedback", icon: MessageSquareText, label: "Feedback" },
  { to: "/prioritization", icon: ListOrdered, label: "Priorisation" },
  { to: "/user-stories", icon: FileText, label: "User Stories" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 pt-8 pb-8">
        <p
          className="text-[18px] font-black tracking-[0.18em] text-sidebar-primary"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          THIGA
        </p>
        <p className="text-[10px] text-sidebar-foreground/40 mt-0.5 tracking-wide">
          PO Agent
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-px">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30 px-3 mb-2">
          Modules
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to} className="relative block">
              <div
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-[13px] ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="h-px bg-sidebar-border mb-4" />
        <p className="text-[10px] text-sidebar-foreground/30 leading-relaxed">
          Assistant IA pour
          <br />
          Product Owners
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
