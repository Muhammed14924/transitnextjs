"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Save,
  Moon,
  Sun,
  Laptop,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/lib/utils";

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-right">
            الإعدادات والتفضيلات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 text-right">
            إدارة إعدادات حسابك الشخصي، المظهر، والإشعارات.
          </p>
        </div>
        <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
          <Save size={16} />
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <SettingsNavItem
            icon={<User size={18} />}
            title="الملف الشخصي"
            active
          />
          <SettingsNavItem icon={<Bell size={18} />} title="الإشعارات" />
          <SettingsNavItem
            icon={<Lock size={18} />}
            title="الأمان وكلمة المرور"
          />
          <SettingsNavItem
            icon={<Palette size={18} />}
            title="المظهر والسمات"
          />
          <SettingsNavItem icon={<Globe size={18} />} title="اللغة والمنطقة" />
          <SettingsNavItem icon={<Shield size={18} />} title="صلاحيات الدور" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <SettingsNavItem
              icon={<HelpCircle size={18} />}
              title="مركز المساعدة"
            />
            <SettingsNavItem
              icon={<LogOut size={18} />}
              title="تسجيل الخروج"
              danger
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
              <CardTitle className="text-xl font-bold text-slate-900">
                الملف الشخصي
              </CardTitle>
              <CardDescription className="text-slate-500">
                تعديل معلوماتك الشخصية التي تظهر في النظام.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-slate-50 pb-8">
                <div className="relative group cursor-pointer h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-300">
                  <User
                    size={32}
                    className="text-primary/30 group-hover:text-primary transition-colors"
                  />
                  <div className="absolute -bottom-1 -left-1 bg-white border border-slate-200 shadow-sm rounded-lg p-1 text-slate-400 font-bold hover:text-primary transition-colors">
                    <Plus size={14} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-900 leading-none">
                    الصورة الرمزية
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    يفضل استخدام صورة مربعة بدقة عالية.
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-9 px-4 text-xs font-bold border-slate-200 text-slate-600"
                    >
                      تغيير الصورة
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg h-9 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-slate-700 font-bold text-sm"
                  >
                    الاسم الكامل
                  </Label>
                  <Input
                    id="firstName"
                    defaultValue="خالد المنصور"
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-700 font-bold text-sm"
                  >
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    defaultValue="khaled@logistics.sa"
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-slate-700 font-bold text-sm"
                  >
                    رقم الجوال
                  </Label>
                  <Input
                    id="phone"
                    defaultValue="+966 50 123 4567"
                    className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="id"
                    className="text-slate-700 font-bold text-sm"
                  >
                    المسمى الوظيفي
                  </Label>
                  <Input
                    id="id"
                    defaultValue="مدير عمليات النقل"
                    className="rounded-xl h-11 border-slate-200 bg-slate-50 border-transparent text-right"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
              <CardTitle className="text-xl font-bold text-slate-900">
                المظهر والسمة
              </CardTitle>
              <CardDescription className="text-slate-500">
                اختر المظهر المفضل للوحة التحكم الخاصة بك.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ThemeSelectionItem
                  icon={<Sun size={20} />}
                  label="فاتح"
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                  color="bg-white border-slate-200"
                />
                <ThemeSelectionItem
                  icon={<Moon size={20} />}
                  label="داكن"
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  color="bg-slate-900 text-white border-slate-800"
                />
                <ThemeSelectionItem
                  icon={<Laptop size={20} />}
                  label="النظام"
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                  color="bg-gradient-to-tr from-white to-slate-200 border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({
  icon,
  title,
  active,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 group hover:pl-2",
        active
          ? "bg-primary/5 text-primary border border-primary/10 pl-6"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        danger && "hover:bg-rose-50 hover:text-rose-600",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-lg transition-colors border-2 border-transparent",
            active
              ? "bg-white text-primary border-primary/5 shadow-sm"
              : "group-hover:bg-white group-hover:text-primary group-hover:border-primary/5 group-hover:shadow-sm",
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-bold tracking-tight">{title}</span>
      </div>
      <ChevronRight
        size={16}
        className={cn(
          "opacity-0 transition-opacity",
          active ? "opacity-30" : "group-hover:opacity-30",
        )}
      />
    </div>
  );
}

function ThemeSelectionItem({
  icon,
  label,
  active,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-2xl border-4 cursor-pointer transition-all hover:scale-[1.05] duration-300",
        active
          ? "border-primary shadow-xl shadow-primary/10"
          : "border-slate-50 shadow-sm opacity-60 hover:opacity-100",
        color,
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
        {icon}
      </div>
      <span className="font-bold text-sm tracking-widest leading-none">
        {label}
      </span>
      {active && (
        <Badge className="bg-primary text-white text-[8px] h-4 py-0 px-2 uppercase font-black tracking-widest shadow-lg -mt-1 border-none">
          Active
        </Badge>
      )}
    </div>
  );
}
