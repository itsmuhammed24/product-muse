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
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>P</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-sidebar-accent-foreground tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              PO Agent
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 tracking-wide uppercase">by Thiga</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-sidebar-border mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative block"
            >
              <div
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-[13px] ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
                <item.icon className="w-[18px] h-[18px] shrink-0 opacity-80" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-5">
        <div className="px-3 py-2.5 rounded-lg bg-sidebar-accent/30">
          <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">
            Assistant IA · Product Owners
          </p>
          <p className="text-[10px] text-sidebar-foreground/30 mt-0.5">v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
