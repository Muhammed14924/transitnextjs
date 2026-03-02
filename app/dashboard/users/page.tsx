"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Settings,
  MoreVertical,
  ShieldAlert,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { apiClient } from "@/app/lib/api-client";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers(searchTerm);
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            التحكم في أعضاء الفريق، توزيع الأدوار، وإدارة حسابات النظام.
          </p>
        </div>
        <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
          <UserPlus size={16} />
          دعوة مستخدم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UserStatCard
          title="إجمالي المستخدمين"
          value={loading ? "..." : users.length.toString()}
          icon={<Users className="text-blue-600" size={18} />}
          detail="أعضاء مسجلين"
        />
        <UserStatCard
          title="نشط حالياً"
          value={loading ? "..." : users.length.toString()}
          icon={<ShieldCheck className="text-emerald-600" size={18} />}
          detail="جاهزية كاملة"
        />
        <UserStatCard
          title="حسابات الإدارة"
          value={
            loading
              ? "..."
              : users.filter((u) => u.role === "ADMIN").length.toString()
          }
          icon={<ShieldAlert className="text-rose-600" size={18} />}
          detail="صلاحيات كاملة"
        />
        <UserStatCard
          title="طلبات معلقة"
          value="0"
          icon={<Plus className="text-amber-600" size={18} />}
          detail="لا توجد طلبات"
        />
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-6">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="بحث باسم المستخدم أو البريد الإلكتروني..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-10 text-xs transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Settings size={16} /> تصفية حسب الدور
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs px-6">
                  المستخدم
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs text-center">
                  الدورالوظيفي
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  الفريق
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  الحالة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs text-center">
                  آخر دخول
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-11 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-slate-50/30 transition-colors border-slate-50 h-[80px] group text-sm"
                  >
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl border-2 border-slate-100 shadow-sm">
                          <AvatarFallback className="text-[10px] text-primary font-black uppercase">
                            {user.username?.substring(0, 2) || "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 text-sm inline-block">
                            {user.username}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Mail size={12} className="text-slate-300" />
                            <span className="font-medium tracking-tight truncate max-w-[150px]">
                              {user.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge
                          className={cn(
                            "rounded-full font-black px-3 py-0 h-6 border-none shadow-sm text-[10px] tracking-wide bg-primary/10 text-primary uppercase",
                          )}
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-600 text-xs text-center">
                          فريق العمل
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider tabular-nums">
                          USR-{user.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-bold px-2.5 py-0 h-6 border-none bg-emerald-50 text-emerald-600",
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full ml-1.5 bg-emerald-600 animate-pulse"></div>
                        متصل
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-inner inline-block">
                        الآن
                      </span>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 rounded-lg"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-xl"
                          >
                            <DropdownMenuItem className="p-2 gap-2 focus:bg-slate-50 rounded-lg text-xs font-bold">
                              تغيير كلمة المرور
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="p-2 gap-2 focus:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">
                              إيقاف الحساب مؤقتاً
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-20 text-slate-400"
                  >
                    {loading
                      ? "جاري تحميل المستخدمين..."
                      : "لا يوجد مستخدمين مسجلين"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function UserStatCard({
  title,
  value,
  icon,
  detail,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  detail: string;
}) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 overflow-hidden group">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-300">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-none">
            {title}
          </span>
          <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums mt-1">
            {value}
          </span>
          <span className="text-[9px] text-slate-400 font-bold mt-1.5">
            {detail}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
