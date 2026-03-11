"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Truck,
  Phone,
  User,
  DollarSign,
  Mail,
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

export default function TransportCompaniesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    trans_name: "",
    contact_person: "",
    phone: "",
    email: "",
    transport_type: "نقل داخلي",
    opening_balance: 0,
    isActive: true,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    trans_name: "",
    contact_person: "",
    phone: "",
    email: "",
    transport_type: "",
    opening_balance: 0,
    isActive: true,
  });

  const types = ["نقل داخلي", "نقل دولي", "ترانزيت", "شحن وتفريغ", "نقل بحري"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = async () => {
    try {
      const res = await apiClient.getTransportCompanies();
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
      await apiClient.createTransportCompany(addData);
      toast.success("تم الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({
        trans_name: "",
        contact_person: "",
        phone: "",
        email: "",
        transport_type: "نقل داخلي",
        opening_balance: 0,
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
      trans_name: item.trans_name || "",
      contact_person: item.contact_person || "",
      phone: item.phone || "",
      email: item.email || "",
      transport_type: item.transport_type || "نقل داخلي",
      opening_balance: item.opening_balance || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateTransportCompany(editData.id, editData);
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
      await apiClient.deleteTransportCompany(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">شركات النقل</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary rounded-xl px-6 cursor-pointer">
              <Plus size={16} /> إضافة شركة نقل
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[500px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                إضافة شركة نقل جديدة
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الشركة</Label>
                <div className="relative">
                  <Truck
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    required
                    value={addData.trans_name}
                    onChange={(e) =>
                      setAddData({ ...addData, trans_name: e.target.value })
                    }
                    className="rounded-xl pr-10"
                    placeholder="شركة الصقر للشحن..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم المندوب / المسؤول</Label>
                  <div className="relative">
                    <User
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
                      dir="ltr"
                      value={addData.phone}
                      onChange={(e) =>
                        setAddData({ ...addData, phone: e.target.value })
                      }
                      className="rounded-xl text-left pl-3 pr-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="email"
                    dir="ltr"
                    value={addData.email}
                    onChange={(e) =>
                      setAddData({ ...addData, email: e.target.value })
                    }
                    className="rounded-xl text-left pl-3 pr-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">نطاق العمل</Label>
                  <select
                    value={addData.transport_type}
                    onChange={(e) =>
                      setAddData({ ...addData, transport_type: e.target.value })
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
                <div className="space-y-2">
                  <Label className="font-bold">الرصيد الافتتاحي</Label>
                  <div className="relative">
                    <DollarSign
                      className="absolute right-3 top-3 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="number"
                      dir="ltr"
                      step="0.01"
                      value={addData.opening_balance}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          opening_balance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl text-left pl-3 pr-10"
                    />
                  </div>
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
                  الشركة نشطة ونتعامل معها
                </Label>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4">
                حفظ الشركة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[500px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل بيانات الشركة
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">اسم الشركة</Label>
              <Input
                required
                value={editData.trans_name}
                onChange={(e) =>
                  setEditData({ ...editData, trans_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">المندوب</Label>
                <Input
                  value={editData.contact_person}
                  onChange={(e) =>
                    setEditData({ ...editData, contact_person: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الهاتف</Label>
                <Input
                  dir="ltr"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="rounded-xl text-left"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">البريد الإلكتروني</Label>
              <Input
                type="email"
                dir="ltr"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="rounded-xl text-left"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">نطاق العمل</Label>
                <select
                  value={editData.transport_type}
                  onChange={(e) =>
                    setEditData({ ...editData, transport_type: e.target.value })
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
                الشركة نشطة
              </Label>
            </div>
            <Button type="submit" className="w-full rounded-xl mt-4">
              حفظ التعديلات
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  النوع
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  المندوب
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الهاتف
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  البريد الإلكتروني
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الرصيد الافتتاحي
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
                  <TableCell colSpan={8} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold text-gray-900">
                      {item.trans_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50">
                        {item.transport_type || "—"}
                      </Badge>
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
                    <TableCell className="text-gray-500">
                      {item.email || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-gray-700">
                      {Number(item.opening_balance).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          نشطة
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
                          className="text-blue-500 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-500 hover:bg-rose-50 cursor-pointer"
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
