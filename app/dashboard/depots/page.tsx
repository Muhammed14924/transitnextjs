"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, MapPin, Calculator, Building, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
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
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";
import { useRouter } from "next/navigation";

export default function DepotsPage() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [traders, setTraders] = useState<any[]>([]);

  useEffect(() => {
    if (!permLoading && !hasPermission(PERMISSIONS.VIEW_DEPOT)) {
      router.push("/dashboard");
    }
  }, [hasPermission, permLoading, router]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    depot_name: "",
    location: "",
    manager_name: "",
    contact_number: "",
    expected_invoices: 1000,
    isActive: true,
    traderId: null as number | null,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    depot_name: "",
    depot_code: "",
    location: "",
    manager_name: "",
    contact_number: "",
    isActive: true,
    Sequence1: 0,
    Sequence2: 0,
    traderId: null as number | null,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const fetchData = async () => {
    try {
      const [depotsRes, tradersRes] = await Promise.all([
        apiClient.getDepots(),
        apiClient.getTraders()
      ]);
      setData(depotsRes || []);
      setTraders(tradersRes || []);
    } catch (e) {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteDialog = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    setDeleteTarget({ id: id as number, name: item?.depot_name || "هذا المستودع" });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteDepot(deleteTarget.id);
      toast.success("تم الحذف بنجاح");
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  const handleDelete = async (id: number | string) => {
    openDeleteDialog(id);
  };

  const handleAdd = async (e?: any) => {
    if (e) e.preventDefault();
    if (!addData.depot_name.trim()) {
      toast.error("يرجى إدخال اسم المستودع");
      return;
    }

    try {
      await apiClient.createDepot(addData);
      toast.success("تمت الإضافة وتوليد التسلسلات بنجاح");
      setIsAddOpen(false);
      setAddData({
        depot_name: "",
        location: "",
        manager_name: "",
        contact_number: "",
        expected_invoices: 1000,
        isActive: true,
        traderId: null,
      });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      depot_name: item.depot_name || "",
      depot_code: item.depot_code || "",
      location: item.location || "",
      manager_name: item.manager_name || "",
      contact_number: item.contact_number || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
      Sequence1: item.Sequence1,
      Sequence2: item.Sequence2,
      traderId: item.traderId || null,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!editData.depot_name.trim()) {
      toast.error("يرجى إدخال اسم المستودع");
      return;
    }

    try {
      await apiClient.updateDepot(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building className="text-primary" /> المستودعات (المراكز)
        </h1>

        {hasPermission(PERMISSIONS.CREATE_DEPOT) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary rounded-xl px-6">
                <Plus size={16} /> إضافة مستودع
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[500px] rounded-2xl p-6 text-right"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  إضافة مستودع جديد
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم المستودع</Label>
                  <Input
                    value={addData.depot_name}
                    onChange={(e) =>
                      setAddData({ ...addData, depot_name: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">الموقع</Label>
                    <Input
                      value={addData.location}
                      onChange={(e) =>
                        setAddData({ ...addData, location: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">أمين المستودع</Label>
                    <Input
                      value={addData.manager_name}
                      onChange={(e) =>
                        setAddData({ ...addData, manager_name: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">رقم التواصل</Label>
                  <Input
                    value={addData.contact_number}
                    onChange={(e) =>
                      setAddData({ ...addData, contact_number: e.target.value })
                    }
                    className="rounded-xl text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">التاجر التابع له</Label>
                  <select
                    value={addData.traderId || ""}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        traderId: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- اختر التاجر --</option>
                    {traders.map((trader: any) => (
                      <option key={trader.id} value={trader.id}>
                        {trader.trader_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3">
                  <Label className="font-bold text-emerald-900 flex items-center gap-2">
                    <Calculator size={16} /> إعدادات تسلسل الفواتير
                  </Label>
                  <div className="space-y-2">
                    <Label className="text-sm text-emerald-800">
                      العدد المتوقع للفواتير (الافتراضي 1000)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={addData.expected_invoices}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          expected_invoices: parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl bg-white"
                    />
                    <p className="text-xs text-emerald-600">
                      سيقوم النظام بتوليد التسلسل تلقائياً في المجال المخصص
                      للمستودعات (80000+).
                    </p>
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
                    className="w-4 h-4 rounded text-primary"
                  />
                  <Label htmlFor="isActive" className="font-bold cursor-pointer">
                    المستودع نشط
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-xl mt-4"
                >
                  حفظ وتوليد التسلسل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[500px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل المستودع
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2 pb-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">كود المركز</p>
                <p className="font-mono font-bold text-sm">
                  {editData.depot_code}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center col-span-2">
                <p className="text-xs text-slate-500 mb-1">تسلسل الفواتير</p>
                <p className="font-mono font-bold text-sm text-primary">
                  {editData.Sequence1 || "—"} - {editData.Sequence2 || "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">الاسم</Label>
              <Input
                value={editData.depot_name}
                onChange={(e) =>
                  setEditData({ ...editData, depot_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">الموقع</Label>
                <Input
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">أمين المستودع</Label>
                <Input
                  value={editData.manager_name}
                  onChange={(e) =>
                    setEditData({ ...editData, manager_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">التاجر التابع له</Label>
              <select
                value={editData.traderId || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    traderId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- اختر التاجر --</option>
                {traders.map((trader: any) => (
                  <option key={trader.id} value={trader.id}>
                    {trader.trader_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editData.isActive}
                onChange={(e) =>
                  setEditData({ ...editData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                المستودع نشط
              </Label>
            </div>
            <Button
              type="button"
              onClick={handleEdit}
              className="w-full rounded-xl mt-4"
            >
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  اسم المستودع
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  التاجر
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الموقع
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  أمين المستودع
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  رقم التواصل
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  بداية التسلسل
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  نهاية التسلسل
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold py-4 w-[100px]">
                  إجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono bg-slate-50"
                      >
                        {item.depot_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {item.depot_name}
                    </TableCell>
                    <TableCell>
                      {item.trader ? (
                        <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                          {item.trader.trader_name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.location || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 text-center">
                      {item.manager_name || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 font-mono text-center" dir="ltr">
                      {item.contact_number || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-emerald-700 font-medium">
                      {item.Sequence1 || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-emerald-700 font-medium">
                      {item.Sequence2 || "—"}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          نشط
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-rose-600 bg-rose-50 border-rose-200"
                        >
                          متوقف
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        {hasPermission(PERMISSIONS.EDIT_DEPOT) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_DEPOT) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(item.id)}
                            className="text-rose-500 hover:bg-rose-50"
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
              حذف المستودع
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 py-4">
              هل أنت متأكد من حذف{" "}
              <strong className="text-slate-900">{deleteTarget?.name}</strong>
              ？ هذا الإجراء لا يمكن التراجعة عنه.
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
