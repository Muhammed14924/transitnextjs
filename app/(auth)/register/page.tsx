"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          teamCode: teamCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل إنشاء الحساب");
      } else {
        window.location.href = "/dashboard"; // Force reload to fetch user data in provider
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex h-screen overflow-hidden">
      {/* Right side visually in RTL (first in flex) -> Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <PackageOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              إنشاء حساب جديد
            </h1>
            <p className="text-slate-500 mt-2 text-center">
              قم بتسجيل بياناتك للوصول إلى النظام اللوجستي
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamCode">رمز الفريق (اختياري)</Label>
              <Input
                id="teamCode"
                type="text"
                placeholder="ENG-2024"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                className="text-left"
                dir="ltr"
              />
              <p className="text-xs text-slate-500 mt-1">
                أدخل رمز الفريق للانضمام لفريق موجود ومشاركة الصلاحيات
              </p>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>

            <div className="text-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-sm">لديك حساب بالفعل؟ </span>
              <Link
                href="/login"
                className="text-primary hover:underline text-sm font-semibold transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Left side visually in RTL (second in flex) -> Illustration */}
      <div className="hidden lg:flex w-1/2 bg-slate-100 dark:bg-slate-950 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-50 dark:from-slate-900 dark:to-slate-800 z-0"></div>

        {/* Abstract shapes representing logistics */}
        <div className="z-10 relative w-full h-full flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl top-1/4 right-1/4"></div>
          <div className="absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl bottom-1/3 left-1/4"></div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-8 max-w-sm z-20 transform translate-y-4 hover:-translate-y-2 transition-transform duration-500">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">
                  أمان للبيانات
                </h3>
                <p className="text-slate-500 text-sm">
                  تشفير قوي وصلاحيات حسب الدور
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              إنشاء حساب في منصتنا يضمن لك بيئة عمل آمنة لإدارة الشحنات
              والعملاء. نوفر مستويات متعددة من الصلاحيات والوصول للفريق.
            </p>
            <div className="flex -space-x-2 -space-x-reverse justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs bg-slate-200 dark:bg-slate-800`}
                >
                  المستخدم {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
