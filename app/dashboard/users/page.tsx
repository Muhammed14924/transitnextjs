"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
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
  AlertTriangle,
  Fingerprint,
  Activity,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers(searchTerm);
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("فشل في تحميل قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createUser(formData);
      setIsInviteDialogOpen(false);
      setFormData({ username: "", email: "", password: "", role: "USER" });
      fetchUsers();
      toast.success("تم إنشاء حساب المستخدم بنجاح");
    } catch (error) {
      console.error("Error creating user", error);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await apiClient.deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      toast.success("تم حذف المستخدم نهائياً");
    } catch (error) {
      console.error("Error deleting user", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (!authLoading && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
        جارٍ التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldAlert className="text-rose-400" size={48} />
        <p className="text-xl font-black text-slate-700">وصول مرفوض</p>
        <p className="text-slate-400 font-medium">هذه الصفحة متاحة لمديري النظام فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            التحكم في أعضاء الفريق، توزيع الأدوار، وإدارة حسابات النظام.
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-11 gap-2 bg-primary shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-6">
              <UserPlus size={18} />
              دعوة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-right text-slate-900 tracking-tight">
                إنشاء حساب جديد
              </DialogTitle>
              <DialogDescription className="text-right text-slate-500 font-medium">
                سجل بيانات العضو الجديد لتفعيل دخوله للنظام.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="grid gap-5 py-6 rtl text-right">
                <div className="space-y-1.5">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-widest px-1">
                    اسم المستخدم
                  </Label>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="مثال: ahmed_dev"
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-widest px-1">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-widest px-1">
                    كلمة المرور المؤقتة
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-slate-700 text-xs uppercase tracking-widest px-1">
                    الدور الوظيفي
                  </Label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="USER">مستخدم عادي</option>
                    <option value="ADMIN">مدير نظام</option>
                    <option value="VIEWER">مشاهد فقط</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="flex-row-reverse sm:justify-start gap-3 pt-4">
                <Button
                  type="submit"
                  className="rounded-2xl px-12 h-12 font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all"
                >
                  تفعيل الحساب
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsInviteDialogOpen(false)}
                  className="rounded-2xl h-12 px-8 font-bold text-slate-400"
                >
                  تراجع
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <UserStatCard
          title="إجمالي الفريق"
          value={loading ? "..." : users.length.toString()}
          icon={<Users className="text-blue-600" size={20} />}
          detail="أعضاء نشطين"
          color="blue"
        />
        <UserStatCard
          title="المشرفين"
          value={
            loading
              ? "..."
              : users.filter((u) => u.role === "ADMIN").length.toString()
          }
          icon={<ShieldAlert className="text-rose-600" size={20} />}
          detail="صلاحية كاملة"
          color="rose"
        />
        <UserStatCard
          title="متصلين الآن"
          value={loading ? "..." : users.length > 0 ? "1" : "0"}
          icon={<Activity className="text-emerald-600" size={20} />}
          detail="حالة الاتصال"
          color="emerald"
        />
        <UserStatCard
          title="تراخيص النظام"
          value="غير محدود"
          icon={<Fingerprint className="text-amber-600" size={20} />}
          detail="خطة المؤسسة"
          color="amber"
        />
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-white">
        <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 px-8">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="بحث باسم المستخدم أو البريد..."
              className="pr-12 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary/30 focus-visible:ring-primary/10 rounded-2xl h-12 text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              className="h-12 rounded-2xl gap-3 border-slate-100 text-slate-600 font-black px-6 bg-white hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            >
              <Settings size={18} /> تصفية الصلاحيات
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14">
                <TableHead className="text-right font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  المستخدم
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  الصلاحية
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  آداء الفريق
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-all border-slate-50 h-[88px] group"
                  >
                    <TableCell className="px-8">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-[18px] border-2 border-white shadow-lg shadow-slate-200">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                            {user.username?.substring(0, 2) || "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-slate-800 text-sm">
                            {user.username}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold tabular-nums">
                            {user.email || "no-email@transit.sa"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge
                          className={cn(
                            "rounded-full font-black px-4 py-1 border-none shadow-sm text-[10px] tracking-widest flex items-center gap-2",
                            user.role === "ADMIN"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {user.role === "ADMIN" ? (
                            <ShieldAlert size={12} />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 flex items-center gap-2 w-fit">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        متصل حالياً
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-white shadow-inner">
                        100% النشاط
                      </span>
                    </TableCell>
                    <TableCell className="px-8">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100"
                        >
                          <Edit size={18} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-2xl"
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-[24px] p-2 border-slate-100 shadow-2xl"
                          >
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                              className="p-3 text-sm font-black text-rose-600 focus:bg-rose-50 rounded-xl gap-3 cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف الحساب
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
                    colSpan={5}
                    className="text-center py-20 text-slate-300 font-bold italic"
                  >
                    {loading ? "جاري جرد الطاقم..." : "لا يوجد مستخدمين مسجلين"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-rose-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-rose-100 rotate-6 hover:rotate-0 transition-transform">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="text-center font-black text-slate-900 text-2xl tracking-tighter">
              حذف حساب مستخدم
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold py-4">
              هل أنت متأكد من حذف حساب{" "}
              <span className="text-slate-900 font-black">
                "{selectedUser?.username}"
              </span>
              ؟
              <br /> سيتم سحب كافة الصلاحيات ومنعه من الدخول للنظام.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-2xl h-14 w-full sm:flex-1 font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-100"
            >
              تأكيد الحذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-14 w-full sm:flex-1 font-black text-slate-500 border-slate-100 bg-slate-50/50"
            >
              تراجع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserStatCard({ title, value, icon, detail, color }: any) {
  const themes: any = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100",
    rose: "text-rose-600 bg-rose-50/50 border-rose-100",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50/50 border-amber-100",
  };
  return (
    <Card className="border-none shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white group">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
            {title}
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter mt-1">
            {value}
          </span>
          <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            {detail}
          </span>
        </div>
        <div
          className={cn(
            "p-4 rounded-3xl border shadow-lg group-hover:rotate-12 transition-all duration-500",
            themes[color],
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
