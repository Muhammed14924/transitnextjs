"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit,
  Trash2,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";
import { useRouter } from "next/navigation";

// --- مكون البطاقة الإحصائية (موجود مسبقاً في ملفك) ---
function TraderSummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  bg,
  border,
}: any) {
  return (
    <Card
      className={cn(
        "border shadow-sm rounded-3xl overflow-hidden hover:-translate-y-1.5 transition-all duration-500 bg-white group",
        border,
      )}
    >
      <CardContent className="p-7">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none block">
              {title}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
                {value}
              </span>
              {trend && (
                <span className="text-[10px] text-primary font-black bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 shadow-sm">
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "p-5 rounded-[22px] border shadow-inner transition-all group-hover:scale-110 duration-500",
              bg,
            )}
          >
            <Icon size={24} className="text-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TradersPage() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!permLoading && !hasPermission(PERMISSIONS.VIEW_TRADER)) {
      router.push("/dashboard");
    }
  }, [hasPermission, permLoading, router]);

  // حالة الإضافة الجديدة (بدون trader_code)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    trader_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    tax_number: "",
    opening_balance: 0,
    credit_limit: 0,
    isActive: true,
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // حالة التعديل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    trader_name: "",
    trader_code: "", // نحتفظ به للعرض فقط
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    tax_number: "",
    opening_balance: 0,
    credit_limit: 0,
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const res = await apiClient.getTraders();
      setData(res || []);
    } catch (e) {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTrader(addData);
      toast.success("تم إضافة التاجر بنجاح");
      setIsAddOpen(false);
      // تصفير البيانات
      setAddData({
        trader_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        tax_number: "",
        opening_balance: 0,
        credit_limit: 0,
        isActive: true,
      });
      fetchData();
    } catch (e) {
      toast.error("خطأ في إضافة التاجر");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      trader_name: item.trader_name || "",
      trader_code: item.trader_code || "",
      contact_person: item.contact_person || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      tax_number: item.tax_number || "",
      opening_balance: item.opening_balance || 0,
      credit_limit: item.credit_limit || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateTrader(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  const openDeleteDialog = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteTrader(deleteTarget.id);
      toast.success("تم الحذف بنجاح");
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  const handleDelete = async (id: number) => {
    const item = data.find((d) => d.id === id);
    openDeleteDialog(id, item?.trader_name || "هذا التاجر");
  };

  // فلترة البيانات بناءً على البحث
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.trader_name?.toLowerCase().includes(query) ||
      item.trader_code?.toLowerCase().includes(query) ||
      item.contact_person?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TraderSummaryCard
          title="إجمالي التجار"
          value={data.length}
          icon={Users}
          bg="bg-blue-50/50"
          border="border-blue-100/50"
        />
        <TraderSummaryCard
          title="التجار النشطين"
          value={data.filter((t) => t.isActive).length}
          icon={Building}
          bg="bg-emerald-50/50"
          border="border-emerald-100/50"
        />
        <TraderSummaryCard
          title="إجمالي الأرصدة (دائن/مدين)"
          value={data.reduce(
            (acc, curr) => acc + Number(curr.opening_balance || 0),
            0,
          )}
          icon={Wallet}
          bg="bg-purple-50/50"
          border="border-purple-100/50"
        />
      </div>

      {/* الرأس والبحث والإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <Input
            placeholder="بحث عن تاجر، كود، أو مسؤول..."
            className="rounded-xl pr-10 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* نافذة الإضافة */}
        {hasPermission(PERMISSIONS.CREATE_TRADER) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6 w-full sm:w-auto">
                <Plus size={16} /> إضافة تاجر جديد
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[600px] rounded-2xl p-6 text-right"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-right text-xl font-bold">
                  إضافة تاجر جديد
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">
                    اسم التاجر / الشركة <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={addData.trader_name}
                    onChange={(e) =>
                      setAddData({ ...addData, trader_name: e.target.value })
                    }
                    className="rounded-xl"
                    placeholder="شركة الأمل التجارية..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">الشخص المسؤول (المندوب)</Label>
                    <div className="relative">
                      <Users
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />
                      <Input
                        value={addData.contact_person}
                        onChange={(e) =>
                          setAddData({
                            ...addData,
                            contact_person: e.target.value,
                          })
                        }
                        className="rounded-xl pr-10"
                        placeholder="السيد أحمد..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">رقم التواصل</Label>
                    <div className="relative">
                      <Phone
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />
                      <Input
                        value={addData.phone}
                        onChange={(e) =>
                          setAddData({ ...addData, phone: e.target.value })
                        }
                        className="rounded-xl pr-10 text-left"
                        dir="ltr"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />
                      <Input
                        type="email"
                        value={addData.email}
                        onChange={(e) =>
                          setAddData({ ...addData, email: e.target.value })
                        }
                        className="rounded-xl pr-10 text-left"
                        dir="ltr"
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">الرقم الضريبي</Label>
                    <Input
                      value={addData.tax_number}
                      onChange={(e) =>
                        setAddData({ ...addData, tax_number: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">العنوان</Label>
                  <div className="relative">
                    <MapPin
                      className="absolute right-3 top-3 text-gray-400"
                      size={16}
                    />
                    <Input
                      value={addData.address}
                      onChange={(e) =>
                        setAddData({ ...addData, address: e.target.value })
                      }
                      className="rounded-xl pr-10"
                      placeholder="المدينة، المنطقة..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">الرصيد الافتتاحي</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addData.opening_balance}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          opening_balance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">
                      الحد الائتماني (سقف الدين)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addData.credit_limit}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          credit_limit: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={addData.isActive}
                    onChange={(e) =>
                      setAddData({ ...addData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isActive" className="font-bold cursor-pointer">
                    حساب التاجر نشط
                  </Label>
                </div>

                <Button type="submit" className="w-full rounded-xl mt-4">
                  حفظ التاجر
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* نافذة التعديل */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[600px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold">
              تعديل بيانات التاجر
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-500">
                كود التاجر (للعرض فقط)
              </Label>
              <Input
                disabled
                value={editData.trader_code}
                className="rounded-xl bg-gray-100 cursor-not-allowed text-center font-bold"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">اسم التاجر / الشركة</Label>
              <Input
                required
                value={editData.trader_name}
                onChange={(e) =>
                  setEditData({ ...editData, trader_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">الشخص المسؤول</Label>
                <Input
                  value={editData.contact_person}
                  onChange={(e) =>
                    setEditData({ ...editData, contact_person: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رقم التواصل</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="rounded-xl text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editData.isActive}
                onChange={(e) =>
                  setEditData({ ...editData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                حساب التاجر نشط
              </Label>
            </div>

            <Button type="submit" className="w-full rounded-xl mt-4">
              حفظ التعديلات
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* جدول عرض التجار */}
      <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-transparent">
                <TableHead className="text-right font-bold py-5 px-6">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  التاجر / الشركة
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  المسؤول
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  رقم التواصل
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  البريد الإلكتروني
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  الرقم الضريبي
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  الرصيد الافتتاحي
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  الحد الائتماني
                </TableHead>
                <TableHead className="text-right font-bold py-5">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold py-5 w-[120px]">
                  إجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-10 text-gray-500"
                  >
                    جاري تحميل التجار...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-10 text-gray-500"
                  >
                    لا توجد بيانات مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-6 font-medium">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs bg-gray-50"
                      >
                        {item.trader_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {item.trader_name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.contact_person || "—"}
                    </TableCell>
                    <TableCell
                      className="text-gray-500 font-mono text-right"
                      dir="ltr"
                    >
                      {item.phone || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {item.email || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-gray-600 text-sm">
                      {item.tax_number || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          Number(item.opening_balance) > 0
                            ? "text-emerald-600 font-bold"
                            : Number(item.opening_balance) < 0
                              ? "text-rose-600 font-bold"
                              : "text-gray-500 font-bold"
                        }
                      >
                        {Number(item.opening_balance)
                          .toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                          .replace("$", "")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-gray-600 font-bold">
                        {Number(item.credit_limit || 0)
                          .toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                          .replace("$", "")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-500">
                          متوقف
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        {hasPermission(PERMISSIONS.EDIT_TRADER) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:bg-blue-50 h-8 w-8 rounded-lg"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_TRADER) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-rose-500 hover:bg-rose-50 h-8 w-8 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl"
          dir="rtl"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="font-black text-slate-900 text-xl">
              حذف التاجر
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 py-4">
              هل أنت متأكد من حذف التاجر{" "}
              <strong className="text-slate-900">{deleteTarget?.name}</strong>
              ？ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </div>
          <DialogFooter className="gap-3 mt-4 flex sm:justify-center">
            <Button
              onClick={confirmDelete}
              className="rounded-2xl h-12 flex-1 bg-rose-600 font-bold hover:bg-rose-700 transition-colors"
            >
              نعم، احذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-12 flex-1 font-bold"
            >
              تراجع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
