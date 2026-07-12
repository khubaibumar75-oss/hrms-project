import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  ClipboardCheck,
  Target,
  ClipboardList,
  X,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/useAuthStore";
import type { RoleName } from "@/types";
import { cn } from "@/lib/utils";

const MANAGER_ROLES: RoleName[] = ["Department Manager"];

const HR_ROLES: RoleName[] = ["Super Admin", "HR Manager"];

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles?: RoleName[];
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },

  {
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: MANAGER_ROLES,
  },

  {
    label: "Attendance",
    path: "/attendance",
    icon: Clock,
  },

  {
    label: "Leave",
    path: "/leave",
    icon: CalendarDays,
  },

  {
    label: "Approvals",
    path: "/leave/approvals",
    icon: ClipboardCheck,
    roles: MANAGER_ROLES,
  },

  {
    label: "HR Approvals",
    path: "/leave/hr-approvals",
    icon: ClipboardCheck,
    roles: HR_ROLES,
  },

  {
    label: "Goals",
    path: "/goals",
    icon: Target,
  },

  {
    label: "Reviews",
    path: "/reviews",
    icon: ClipboardList,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const roleName = useAuthStore((s) => {
    const role = s.user?.role;

    if (!role) return undefined;

    return typeof role === "string" ? role : role.name;
  });

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!roleName) return false;

    // Super Admin sees only Dashboard, Goals and Reviews
    if (roleName === "Super Admin") {
      return ["/dashboard", "/goals", "/reviews"].includes(item.path);
    }

    // Department Manager
    if (roleName === "Department Manager") {
      return (
        item.path !== "/leave" &&
        (!item.roles || item.roles.includes("Department Manager"))
      );
    }

    // HR Manager
    // HR Manager
    if (roleName === "HR Manager") {
      return [
        "/dashboard",
        "/leave/hr-approvals",
        "/goals",
        "/reviews",
      ].includes(item.path);
    }

    // Employee
    if (roleName === "Employee") {
      return [
        "/dashboard",
        "/attendance",
        "/leave",
        "/goals",
        "/reviews",
      ].includes(item.path);
    }

    return false;
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-base font-bold text-accent-foreground">
              H
            </div>

            <span className="font-display text-base font-semibold tracking-tight">
              HRMS
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "reporting-line bg-sidebar-accent pl-[calc(0.75rem+2px)] text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-xs text-sidebar-foreground/50">
            Enterprise HRMS · v1.1
          </p>
        </div>
      </aside>
    </>
  );
}
