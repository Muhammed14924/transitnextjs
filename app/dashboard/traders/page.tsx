"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Users,
  CreditCard,
  ShoppingBag,
  MoreVertical,
  History,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  AlertTriangle,
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
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

interface Trader {
  id: number;
  trader: string;
  trader_code: string;
  _count?: {
    trans_2: number;
  };
}

export default function TradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);

  const [formData, setFormData] = useState({
    trader: "",
    trader_code: "",
  });

  const fetchTraders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTraders(searchTerm);
      if (data) {
        setTraders(data);
      }
    } catch (error) {
      console.error("Failed to fetch traders", error);
      toast.error("فشل في تحميل بيانات التجار");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTrader(formData);
      setIsAddDialogOpen(false);
      setFormData({ trader: "", trader_code: "" });
      fetchTraders();
      toast.success("تمت إضافة التاجر بنجاح");
    } catch (error) {
      console.error("Error creating trader", error);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrader) return;
    try {
      await apiClient.updateTrader(selectedTrader.id, formData);
      setIsEditDialogOpen(false);
      setSelectedTrader(null);
      setFormData({ trader: "", trader_code: "" });
      fetchTraders();
      toast.success("تم تحديث بيانات التاجر");
    } catch (error) {
      console.error("Error updating trader", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    if (!selectedTrader) return;
    try {
      await apiClient.deleteTrader(selectedTrader.id);
      setIsDeleteDialogOpen(false);
      setSelectedTrader(null);
      fetchTraders();
      toast.success("تم حذف التاجر بنجاح");
    } catch (error) {
      console.error("Error deleting trader", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (trader: Trader) => {
    setSelectedTrader(trader);
    setFormData({
      trader: trader.trader,
      trader_code: trader.trader_code || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة التجار والموردين
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة سجلات التجار، الصفقات المنفذة، والعلاقات التجارية.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
              <Plus size={16} />
              إضافة تاجر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-right text-slate-900">
                إضافة تاجر جديد
              </DialogTitle>
              <DialogDescription className="text-right text-slate-500">
                أدخل تفاصيل التاجر الجديد ليتم تسجيله في النظام.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-6 rtl text-right">
                <div className="space-y-1.5">
                  <Label htmlFor="trader" className="font-bold text-slate-700">
                    اسم التاجر
                  </Label>
                  <Input
                    id="trader"
                    value={formData.trader}
                    onChange={(e) =>
                      setFormData({ ...formData, trader: e.target.value })
                    }
                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="trader_code"
                    className="font-bold text-slate-700"
                  >
                    كود التاجر
                  </Label>
                  <Input
                    id="trader_code"
                    value={formData.trader_code}
                    onChange={(e) =>
                      setFormData({ ...formData, trader_code: e.target.value })
                    }
                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                    placeholder="مثال: ABC"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-2">
                <Button
                  type="submit"
                  className="rounded-xl px-10 h-11 bg-primary hover:bg-primary/90 font-bold"
                >
                  حفظ
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-xl h-11 px-6"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TraderSummaryCard
          title="إجمالي التجار"
          value={loading ? "..." : traders.length.toString()}
          icon={<Users className="text-blue-600" size={18} />}
          trend="نشط"
          border="border-blue-100"
        />
        <TraderSummaryCard
          title="إجمالي المعاملات"
          value={
            loading
              ? "..."
              : traders
                  .reduce((acc, t) => acc + (t._count?.trans_2 || 0), 0)
                  .toString()
          }
          icon={<ShoppingBag className="text-emerald-600" size={18} />}
          trend="تراكمي"
          border="border-emerald-100"
        />
        <TraderSummaryCard
          title="أحدث تاجر"
          value={loading ? "..." : traders[0]?.trader || "لا يوجد"}
          icon={<CreditCard className="text-amber-600" size={18} />}
          trend="جديد"
          border="border-amber-100"
        />
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="بحث باسم التاجر أو الكود..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchTraders()}
              className="h-11 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 px-6 font-medium"
            >
              تحديث البيانات
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14">
                <TableHead className="text-right font-black text-slate-700 text-xs px-6 uppercase tracking-widest">
                  المعرف
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  الاسم
                </TableHead>
                <TableHead className="text-right font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  معلومات التواصل
                </TableHead>
                <TableHead className="text-right font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  إجمالي المعاملات
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-6 uppercase tracking-widest px-10">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traders.length > 0 ? (
                traders.map((trader) => (
                  <TableRow
                    key={trader.id}
                    className="hover:bg-slate-50/30 transition-colors border-slate-50 h-[80px] group"
                  >
                    <TableCell className="px-6">
                      <span className="font-bold text-slate-400 text-xs tracking-wider">
                        #{trader.trader_code || trader.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3 justify-center">
                        <Avatar className="h-10 w-10 border border-slate-100 bg-white rounded-2xl shadow-sm">
                          <AvatarFallback className="text-xs text-primary font-black uppercase">
                            {trader.trader?.substring(0, 2) || "TR"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-900 text-sm">
                          {trader.trader}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold">
                          <Phone size={12} className="text-slate-300" />
                          <span dir="ltr">N/A</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <Mail size={12} className="text-slate-300" />
                          <span className="truncate max-w-[120px]">N/A</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge
                        className={cn(
                          "rounded-full font-black px-3 py-0.5 h-6 border-none shadow-sm bg-emerald-50 text-emerald-600",
                        )}
                      >
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <div className="inline-flex items-center gap-1.5 text-slate-900 font-black tabular-nums bg-slate-100 px-3 py-1 rounded-full text-xs">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {trader._count?.trans_2 || 0} عملية
                      </div>
                    </TableCell>
                    <TableCell className="px-6 px-10">
                      <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(trader)}
                          className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit size={16} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-2xl p-2 border-slate-100 shadow-xl"
                          >
                            <DropdownMenuItem className="p-3 text-sm focus:bg-slate-50 rounded-xl gap-3 cursor-pointer">
                              <History size={16} className="text-slate-400" />{" "}
                              سجل الطلبات
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(trader)}
                              className="p-3 text-sm focus:bg-rose-50 text-rose-600 rounded-xl gap-3 cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف التاجر
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
                    className="text-center py-24 text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <MapPin size={40} className="text-slate-100" />
                      <p className="font-bold text-sm">
                        {loading
                          ? "جاري جلب قائمة التجار..."
                          : "لا يوجد تجار مسجلين حالياً"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right text-slate-900">
              تعديل بيانات التاجر
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتعديل بيانات التاجر واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-6 rtl text-right">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_trader"
                  className="font-bold text-slate-700"
                >
                  اسم التاجر
                </Label>
                <Input
                  id="edit_trader"
                  value={formData.trader}
                  onChange={(e) =>
                    setFormData({ ...formData, trader: e.target.value })
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_trader_code"
                  className="font-bold text-slate-700"
                >
                  كود التاجر
                </Label>
                <Input
                  id="edit_trader_code"
                  value={formData.trader_code}
                  onChange={(e) =>
                    setFormData({ ...formData, trader_code: e.target.value })
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200"
                  placeholder="مثال: ABC"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-2">
              <Button
                type="submit"
                className="rounded-xl px-10 h-11 bg-primary hover:bg-primary/90 font-bold font-bold"
              >
                حفظ التغييرات
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-11 px-6"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="text-center font-black text-slate-900 text-xl tracking-tight">
              تأكيد حذف التاجر
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium leading-relaxed py-4">
              هل أنت متأكد من رغبتك في حذف التاجر{" "}
              <span className="font-black text-slate-900">
                "{selectedTrader?.trader}"
              </span>
              ؟
              <br />
              سيتم حذف كافة البيانات المتعلقة به في النظام.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-2xl h-14 w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-100"
            >
              نعم، تأكيد الحذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-14 w-full sm:flex-1 font-bold text-slate-500 border-slate-100 bg-slate-50/50"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TraderSummaryCard({ title, value, icon, trend, border }: any) {
  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-500 bg-white",
        border,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {title}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
                {value}
              </span>
              <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                {trend}
              </span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm text-slate-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
