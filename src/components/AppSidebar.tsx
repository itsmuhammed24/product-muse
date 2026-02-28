import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, ListOrdered, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/feedback", icon: MessageSquareText, label: "Analyse Feedback" },
  { to: "/prioritization", icon: ListOrdered, label: "Priorisation" },
  { to: "/user-stories", icon: FileText, label: "User Stories" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-warm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-primary-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              PO Agent
            </h1>
            <p className="text-xs text-sidebar-foreground opacity-60">by Thiga</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative block"
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-warm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-3 rounded-lg bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground opacity-70">
            Assistant IA pour Product Owners
          </p>
          <p className="text-xs text-sidebar-foreground opacity-40 mt-1">v1.0 — Entretien Thiga</p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
