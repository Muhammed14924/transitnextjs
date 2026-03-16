"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  GitBranch,
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

interface SubCompany {
  id: number;
  sub_company_name: string;
  company_id: number;
  isActive: boolean;
  company?: {
    company_name: string;
  };
}

interface Company {
  id: number;
  company_name: string;
}

export default function SubCompaniesPage() {
  const [data, setData] = useState<SubCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Add State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    sub_company_name: "",
    company_id: "",
    isActive: true,
  });

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    sub_company_name: "",
    company_id: "",
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const [subRes, compRes] = await Promise.all([
        apiClient.getSubCompanies(),
        apiClient.getCompanies(),
      ]);
      setData(subRes || []);
      setCompanies(compRes || []);
    } catch {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!addData.sub_company_name.trim() || !addData.company_id) {
      toast.error("يرجى إكمال البيانات المطلوبة");
      return;
    }

    try {
      await apiClient.createSubCompany(addData);
      toast.success("تم الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({ sub_company_name: "", company_id: "", isActive: true });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطأ في الإضافة";
      toast.error(message);
    }
  };

  const handleEditClick = (item: SubCompany) => {
    setEditData({
      id: item.id,
      sub_company_name: item.sub_company_name || "",
      company_id: item.company_id.toString(),
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editData.sub_company_name.trim() || !editData.company_id) {
      toast.error("يرجى إكمال البيانات المطلوبة");
      return;
    }

    try {
      await apiClient.updateSubCompany(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch {
      toast.error("خطأ في التعديل");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deleteSubCompany(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch {
      toast.error("لا يمكن الحذف لوجود ارتباطات سابقة.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="text-primary" /> إدارة الشركات الفرعية (المصدرة)
        </h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary rounded-xl px-6">
              <Plus size={16} /> إضافة شركة فرعية
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[500px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                إضافة شركة فرعية جديدة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الشركة الفرعية (كما يظهر في الفاتورة)</Label>
                <Input
                  value={addData.sub_company_name}
                  onChange={(e) =>
                    setAddData({ ...addData, sub_company_name: e.target.value })
                  }
                  className="rounded-xl"
                  placeholder="مثال: شركة اورجينال للتجارة..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الشركة الأساسية التابعة لها</Label>
                <select
                  value={addData.company_id}
                  onChange={(e) =>
                    setAddData({ ...addData, company_id: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background"
                >
                  <option value="">اختر الشركة الأساسية...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
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
                  نشطة
                </Label>
              </div>

              <Button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl mt-4"
              >
                حفظ البيانات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">#</TableHead>
                <TableHead className="text-right font-bold py-4">اسم الشركة الفرعية</TableHead>
                <TableHead className="text-right font-bold py-4">الشركة الأساسية</TableHead>
                <TableHead className="text-center font-bold py-4">الحالة</TableHead>
                <TableHead className="text-center font-bold py-4 w-[100px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">لا توجد شركات فرعية</TableCell>
                </TableRow>
              ) : (
                data.map((item: SubCompany, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-400">{index + 1}</TableCell>
                    <TableCell className="font-bold text-gray-900">{item.sub_company_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit bg-slate-50">
                        <Building2 size={12} className="text-blue-500" />
                        {item.company?.company_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">نشط</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">غير نشط</Badge>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[500px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تعديل الشركة الفرعية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">اسم الشركة الفرعية</Label>
              <Input
                value={editData.sub_company_name}
                onChange={(e) =>
                  setEditData({ ...editData, sub_company_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">الشركة الأساسية</Label>
              <select
                value={editData.company_id}
                onChange={(e) =>
                  setEditData({ ...editData, company_id: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-input bg-background"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
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
              <Label htmlFor="editIsActive" className="font-bold cursor-pointer">
                نشطة
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
    </div>
  );
}
