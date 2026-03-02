"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
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
      {/* Right side visually in RTL (first in flex) -> Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <Truck size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              أهلاً بك مجدداً
            </h1>
            <p className="text-slate-500 mt-2 text-center">
              أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
              </div>
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

            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-primary shadow-sm focus:ring-primary"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                تذكرني
              </Label>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <div className="text-center mt-6">
              <span className="text-slate-500 text-sm">ليس لديك حساب؟ </span>
              <Link
                href="/register"
                className="text-primary hover:underline text-sm font-semibold transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Left side visually in RTL (second in flex) -> Illustration */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-primary/80 mix-blend-multiply z-0"></div>

        <div className="z-10 text-center text-white p-12 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">نظام إدارة النقل اللوجستي</h2>
          <p className="text-lg text-slate-200 opacity-90 leading-relaxed mb-8">
            منصة متكاملة لإدارة الشحنات العابرة للحدود، تتبع النقل، وإدارة
            بيانات الشركات والعملاء بفعالية وأمان.
          </p>
          <div className="grid grid-cols-2 gap-4 text-right">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              <h4 className="font-bold text-xl">تتبع مباشر</h4>
              <p className="text-sm text-slate-200 mt-1">
                مراقبة الشحنات لحظة بلحظة
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              <h4 className="font-bold text-xl">تحليل ذكي</h4>
              <p className="text-sm text-slate-200 mt-1">
                إحصائيات وتقارير لوجستية
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
