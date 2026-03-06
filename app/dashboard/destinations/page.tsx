"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, MapPin } from "lucide-react";
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
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function DestinationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    destination_name: "",
    destination_type: "مدينة",
    isActive: true,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    destination_name: "",
    destination_type: "",
    isActive: true,
  });

  const types = ["مدينة", "مستودع", "تاجر", "منطقة حدودية", "أخرى"];

  const fetchData = async () => {
    try {
      const res = await apiClient.getDestinations();
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
      await apiClient.createDestination(addData);
      toast.success("تم الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({
        destination_name: "",
        destination_type: "مدينة",
        isActive: true,
      });
      fetchData();
    } catch (e) {
      toast.error("خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      destination_name: item.destination_name || "",
      destination_type: item.destination_type || "مدينة",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateDestination(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deleteDestination(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الوجهات</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary rounded-xl px-6 cursor-pointer">
              <Plus size={16} /> إضافة وجهة
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[425px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                إضافة وجهة جديدة
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">
                  اسم الوجهة (مثال: حلب، مستودع الأمل)
                </Label>
                <Input
                  required
                  value={addData.destination_name}
                  onChange={(e) =>
                    setAddData({ ...addData, destination_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">نوع الوجهة</Label>
                <select
                  value={addData.destination_type}
                  onChange={(e) =>
                    setAddData({ ...addData, destination_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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
                  الوجهة متاحة للاختيار
                </Label>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4">
                حفظ الوجهة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[425px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل الوجهة
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">اسم الوجهة</Label>
              <Input
                required
                value={editData.destination_name}
                onChange={(e) =>
                  setEditData({ ...editData, destination_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">نوع الوجهة</Label>
              <select
                value={editData.destination_type}
                onChange={(e) =>
                  setEditData({ ...editData, destination_type: e.target.value })
                }
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                الوجهة متاحة للاختيار
              </Label>
            </div>
            <Button type="submit" className="w-full rounded-xl mt-4">
              حفظ التعديلات
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  اسم الوجهة
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  النوع
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
                  <TableCell colSpan={4} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold">
                      {item.destination_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.destination_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          متاحة
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-rose-600 bg-rose-50 border-rose-200"
                        >
                          متوقفة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="text-blue-500 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
