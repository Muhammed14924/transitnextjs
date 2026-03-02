"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import {
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-500"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>

        <div className="relative w-full max-w-md hidden md:block">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="بحث عن شحنة، شركة، أو رقم بوليصة..."
            className="pr-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:bg-slate-100 rounded-xl relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white dark:border-slate-900"></span>
          </Button>
        </div>

        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-2 hover:bg-slate-100 rounded-xl transition-all h-11"
            >
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src="" alt={user?.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                  {user?.name?.substring(0, 2) || "م"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start gap-0.5 ml-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none capitalize">
                  {user?.name || "المستخدم"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 py-0 border-primary/20 bg-primary/5 text-primary"
                >
                  {user?.role === "ADMIN"
                    ? "مدير نظام"
                    : user?.role === "MANAGER"
                      ? "مدير"
                      : "موظف"}
                </Badge>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 mt-1 p-2 rounded-2xl border-slate-200 shadow-xl shadow-slate-200/50"
          >
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-900 capitalize">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuItem className="p-2 rounded-xl focus:bg-slate-50 cursor-pointer gap-2">
              <User size={16} className="text-slate-500" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2 rounded-xl focus:bg-slate-50 cursor-pointer gap-2">
              <Settings size={16} className="text-slate-500" />
              <span>إعدادات الحساب</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2 rounded-xl focus:bg-slate-50 cursor-pointer gap-2">
              <HelpCircle size={16} className="text-slate-500" />
              <span>مركز المساعدة</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuItem
              onClick={logout}
              className="p-2 rounded-xl focus:bg-destructive/5 text-destructive cursor-pointer gap-2"
            >
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
