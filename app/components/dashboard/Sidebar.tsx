"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  LayoutDashboard,
  Truck,
  Building2,
  PackageSearch,
  Users,
  Settings,
  UserCheck,
  ShipWheel,
  ChevronRight,
  ChevronLeft,
  X,
  GitBranch,
  ShieldCheck,
  DoorOpen,
  Anchor,
  MapPin,
  Scale,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    name: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    name: "إدارة النقل البحري",
    href: "/dashboard/shipments",
    icon: ShipWheel,
    permission: PERMISSIONS.VIEW_SHIPMENT,
  },
  {
    name: "إدارة النقل البري",
    href: "/dashboard/transport-trips",
    icon: Truck,
    permission: PERMISSIONS.VIEW_TRIP,
  },
  {
    name: "إدارة الشركات",
    href: "/dashboard/companies",
    icon: Building2,
    permission: PERMISSIONS.VIEW_COMPANIES,
  },
  {
    name: "الشركات الفرعية",
    href: "/dashboard/sub-companies",
    icon: GitBranch,
    permission: PERMISSIONS.VIEW_SUB_COMPANY,
  },
  {
    name: "التجار",
    href: "/dashboard/traders",
    icon: UserCheck,
    permission: PERMISSIONS.VIEW_TRADER,
  },
  {
    name: "المستودعات",
    href: "/dashboard/depots",
    icon: Building2,
    permission: PERMISSIONS.VIEW_DEPOT,
  },
  {
    name: "شركات النقل",
    href: "/dashboard/transport-companies",
    icon: Truck,
    permission: PERMISSIONS.VIEW_TRANSPORT_COMPANY,
  },

  // --- الجداول اللوجستية المضافة حديثاً للسايد بار بناء على طلب المستخدم ---
  {
    name: "المعابر",
    href: "/dashboard/gates",
    icon: DoorOpen,
    permission: PERMISSIONS.VIEW_GATE,
  },
  {
    name: "الموانئ",
    href: "/dashboard/ports",
    icon: Anchor,
    permission: PERMISSIONS.VIEW_PORT,
  },
  {
    name: "الوجهات و المصادر",
    href: "/dashboard/destinations",
    icon: MapPin,
    permission: PERMISSIONS.VIEW_DESTINATION,
  },
  {
    name: "الوحدات",
    href: "/dashboard/units",
    icon: Scale,
    permission: PERMISSIONS.VIEW_UNIT,
  },

  {
    name: " إدارة الاصناف الرئيسية",
    href: "/dashboard/item-types",
    icon: PackageSearch,
    permission: PERMISSIONS.VIEW_ITEM_TYPE,
  },
  {
    name: "إدارة الأصناف والمنتجات",
    href: "/dashboard/company-items",
    icon: PackageSearch,
    permission: PERMISSIONS.VIEW_COMP_ITEM,
  },
  {
    name: "المستخدمين",
    href: "/dashboard/users",
    icon: Users,
    permission: PERMISSIONS.VIEW_USERS,
  },
  {
    name: "الصلاحيات والأدوار",
    href: "/dashboard/admin/roles",
    icon: ShieldCheck,
    permission: PERMISSIONS.MANAGE_USERS,
    adminOnly: true,
  },
  { name: "إعدادات الحساب", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobile,
  onClose,
}: SidebarProps) {
  const { user } = useAuth();
  const { hasPermission, loading: permsLoading } = usePermissions();
  const pathname = usePathname();

  const visibleNavItems = useMemo(() => {
    if (permsLoading) return [];
    return navItems.filter((item) => {
      // Admin check for sensitive areas
      if (item.adminOnly && user?.role !== "ADMIN") return false;

      // Fine-grained permission check
      if (item.permission && !hasPermission(item.permission)) return false;

      return true;
    });
  }, [user, hasPermission, permsLoading]);

  return (
    <aside
      className={cn(
        "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 h-full border-l border-slate-800",
        collapsed ? "w-20" : "w-64",
        mobile ? "w-64" : "",
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-800 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg text-white">
              <Truck size={20} />
            </div>
            <span className="font-bold text-white text-lg truncate">
              لوجستي ترانزيت
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto p-1.5 bg-primary rounded-lg text-white">
            <Truck size={20} />
          </div>
        )}
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all group",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "hover:bg-slate-800 hover:text-white",
              )}
              title={collapsed ? item.name : ""}
            >
              <item.icon
                size={20}
                className={cn(
                  "shrink-0",
                  isActive
                    ? "text-white"
                    : "group-hover:text-primary transition-colors",
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
              {!collapsed && isActive && (
                <div className="mr-auto">
                  <ChevronLeft size={16} className="opacity-50" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-800/50 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              الدعم الفني
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              هل تحتاج لمساعدة في إدارة شحناتك؟
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-700 hover:bg-slate-800 text-xs"
            >
              تواصل معنا
            </Button>
          </div>
        ) : (
          <div className="flex justify-center flex-col items-center gap-4">
            {/* Simple help icon when collapsed if needed */}
          </div>
        )}

        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full mt-4 text-slate-500 hover:text-white hover:bg-slate-800 justify-center h-8"
          >
            {collapsed ? (
              <ChevronLeft size={18} />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronRight size={18} />
                <span className="text-xs">تصغير القائمة</span>
              </div>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
}
