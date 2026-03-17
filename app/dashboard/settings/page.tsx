"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User as UserIcon,
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
  Loader2,
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
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("system");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));

      // Fetch permissions for the specific tab
      fetch("/api/auth/permissions")
        .then(res => res.json())
        .then(data => setUserPermissions(data.permissions || []))
        .catch(err => console.error("Error fetching permissions:", err));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطأ في تحديث البيانات");
      }

      toast.success("تم تحديث الملف الشخصي بنجاح");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

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
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <SettingsNavItem
            icon={<UserIcon size={18} />}
            title="الملف الشخصي"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SettingsNavItem 
            icon={<Bell size={18} />} 
            title="الإشعارات" 
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          />
          <SettingsNavItem
            icon={<Lock size={18} />}
            title="الأمان وكلمة المرور"
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
          <SettingsNavItem
            icon={<Palette size={18} />}
            title="المظهر والسمات"
            active={activeTab === "appearance"}
            onClick={() => setActiveTab("appearance")}
          />
          <SettingsNavItem 
            icon={<Globe size={18} />} 
            title="اللغة والمنطقة" 
            active={activeTab === "language"}
            onClick={() => setActiveTab("language")}
          />
          <SettingsNavItem 
            icon={<Shield size={18} />} 
            title="صلاحيات الدور" 
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
          />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <SettingsNavItem
              icon={<HelpCircle size={18} />}
              title="مركز المساعدة"
              active={activeTab === "help"}
              onClick={() => setActiveTab("help")}
            />
            <SettingsNavItem
              icon={<LogOut size={18} />}
              title="تسجيل الخروج"
              danger
              onClick={logout}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {activeTab === "profile" && (
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
                    <UserIcon
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
                      htmlFor="fullName"
                      className="text-slate-700 font-bold text-sm"
                    >
                      الاسم الكامل
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-slate-700 font-bold text-sm"
                    >
                      الدور في النظام
                    </Label>
                    <Input
                      value={user?.role || "GUEST"}
                      className="rounded-xl h-11 border-slate-200 bg-slate-50 border-transparent text-right"
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-900">
                  إعدادات الإشعارات
                </CardTitle>
                <CardDescription className="text-slate-500">
                  تحكم في كيفية استقبالك للتنبيهات والرسائل.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {[
                  { title: "إشعارات البريد الإلكتروني", desc: "استلام ملخصات يومية عن الشحنات والعمليات." },
                  { title: "تنبيهات النظام الرئيسية", desc: "الحصول على تنبيهات فورية داخل التطبيق عند حدوث تغيير." },
                  { title: "تنبيهات حالة الشحن", desc: "إرسال رسائل عند وصول الشحنات إلى الوجهات النهائية." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary/20 p-1 cursor-pointer">
                      <div className="h-4 w-4 rounded-full bg-primary translate-x-5" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-900">
                  الأمان وكلمة المرور
                </CardTitle>
                <CardDescription className="text-slate-500">
                  تحديث كلمة المرور الخاصة بك لتأمين حسابك.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-sm">
                      كلمة المرور الجديدة
                    </Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-sm">
                      تأكيد كلمة المرور
                    </Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
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
          )}

          {activeTab === "language" && (
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-900">
                  اللغة والمنطقة
                </CardTitle>
                <CardDescription className="text-slate-500">
                  اختر لغة الواجهة وتنسيق التاريخ المفضل لديك.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-sm">اللغة الافتراضية</Label>
                    <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                      <span className="font-bold">العربية (Arabic)</span>
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-sm">تنسيق الوقت والتاريخ</Label>
                    <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                      <span className="font-bold">DD/MM/YYYY (UTC+3)</span>
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "roles" && (
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-900">
                  صلاحيات الدور
                </CardTitle>
                <CardDescription className="text-slate-500">
                  قائمة بالمهام التي يمكنك القيام بها بناءً على دورك الحالي: <Badge className="mr-2">{user?.role}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPermissions.length > 0 ? (
                    userPermissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Shield size={14} className="text-primary" />
                        <span className="text-sm font-bold text-slate-700">{perm.replace(/_/g, " ")}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 col-span-2 text-right">جاري تحميل قائمة الصلاحيات...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "help" && (
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden text-right">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-6 px-8">
                <CardTitle className="text-xl font-bold text-slate-900">
                  مركز المساعدة والدعم
                </CardTitle>
                <CardDescription className="text-slate-500">
                  تحتاج إلى مساعدة؟ فريقنا الفني متاح لخدمتك.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                    <HelpCircle className="text-primary" size={24} />
                    <h4 className="font-bold text-slate-900">الأسئلة الشائعة</h4>
                    <p className="text-xs text-slate-500">تصفح دليل الدروس والأسئلة لتعلم كيفية استخدام النظام.</p>
                    <Button variant="link" className="p-0 h-auto text-primary font-bold">عرض الدليل</Button>
                  </div>
                  <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
                    <Bell className="text-indigo-600" size={24} />
                    <h4 className="font-bold text-slate-900">الدعم الفني المباشر</h4>
                    <p className="text-xs text-slate-500">تحدث مع أحد ممثلي الدعم الفني لحل مشكلتك الآن.</p>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold">بدء الدردشة</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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



