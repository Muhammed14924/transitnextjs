"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, Edit, Plus, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
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
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function CompanyItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_ar_name: "",
    item_en_name: "",
    company_name: "",
    price: "",
    item_type: "",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    item_ar_name: "",
    item_en_name: "",
    company_name: "",
    price: "",
    item_type: "",
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [itemTypes, setItemTypes] = useState<any[]>([]);

  const fetchDropdowns = async () => {
    try {
      const cps = await apiClient.getCompanies();
      if (cps) setCompanies(cps);
      const types = await apiClient.getTypeofitems();
      if (types) setItemTypes(types);
    } catch (e) {}
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompItems();
      if (data) setItems(data);
    } catch (error) {
      toast.error("فشل جلب عناصر الشركات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchDropdowns();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createCompItem(formData);
      toast.success("تمت الإضافة بنجاح");
      setIsAddOpen(false);
      setFormData({
        item_ar_name: "",
        item_en_name: "",
        company_name: "",
        price: "",
        item_type: "",
      });
      fetchItems();
    } catch (error) {
      toast.error("خطأ أثناء الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      item_ar_name: item.item_ar_name || "",
      item_en_name: item.item_en_name || "",
      company_name: item.company_name || "",
      price: item.price !== null ? String(item.price) : "",
      item_type: item.item_type || "",
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateCompItem(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchItems();
    } catch (error) {
      toast.error("خطأ أثناء التعديل");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    try {
      await apiClient.deleteCompItem(id);
      toast.success("تم الحذف بنجاح");
      fetchItems();
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.item_ar_name?.includes(searchTerm) ||
      i.item_en_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.companies?.company_name?.includes(searchTerm),
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            عناصر الشركات (المنتجات)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            سجل بجميع العناصر والمنتجات التابعة للشركات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all px-6">
                <Plus size={16} /> إضافة عنصر جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-right text-xl font-bold">
                  إضافة عنصر جديد
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleAdd}
                className="space-y-4 pt-4 text-right"
                dir="rtl"
              >
                <div className="space-y-2">
                  <Label className="block font-bold">الاسم (عربي)</Label>
                  <Input
                    required
                    value={formData.item_ar_name}
                    onChange={(e) =>
                      setFormData({ ...formData, item_ar_name: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">الاسم (إنجليزي)</Label>
                  <Input
                    value={formData.item_en_name}
                    onChange={(e) =>
                      setFormData({ ...formData, item_en_name: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">الشركة</Label>
                  <select
                    required
                    className="flex w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  >
                    <option value="">اختر الشركة...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">التصنيف</Label>
                  <select
                    className="flex w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.item_type}
                    onChange={(e) =>
                      setFormData({ ...formData, item_type: e.target.value })
                    }
                  >
                    <option value="">اختر التصنيف...</option>
                    {itemTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.item_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">السعر</Label>
                  <Input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <DialogFooter className="mt-6 flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary"
                  >
                    حفظ وإضافة
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-right text-xl font-bold">
                  تعديل العنصر
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleEdit}
                className="space-y-4 pt-4 text-right"
                dir="rtl"
              >
                <div className="space-y-2">
                  <Label className="block font-bold">الاسم (عربي)</Label>
                  <Input
                    required
                    value={editData.item_ar_name}
                    onChange={(e) =>
                      setEditData({ ...editData, item_ar_name: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">الاسم (إنجليزي)</Label>
                  <Input
                    value={editData.item_en_name}
                    onChange={(e) =>
                      setEditData({ ...editData, item_en_name: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">الشركة</Label>
                  <select
                    required
                    className="flex w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editData.company_name}
                    onChange={(e) =>
                      setEditData({ ...editData, company_name: e.target.value })
                    }
                  >
                    <option value="">اختر الشركة...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">التصنيف</Label>
                  <select
                    className="flex w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editData.item_type}
                    onChange={(e) =>
                      setEditData({ ...editData, item_type: e.target.value })
                    }
                  >
                    <option value="">اختر التصنيف...</option>
                    {itemTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.item_type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="block font-bold">السعر</Label>
                  <Input
                    type="number"
                    required
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                    className="rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>
                <DialogFooter className="mt-6 flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary"
                  >
                    حفظ التعديلات
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-[28px] overflow-hidden bg-white border-none">
        <CardHeader className="bg-white border-b border-slate-50 py-8 px-8 flex flex-row items-center gap-4">
          <div className="relative w-full max-w-md group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="ابحث باسم العنصر أو الشركة..."
              className="pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/20 rounded-[20px] h-12 text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14">
                <TableHead className="text-right font-black text-slate-400 text-xs px-8 uppercase">
                  اسم العنصر (عربي/إنجليزي)
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase">
                  الشركة
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase">
                  التصنيف
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase">
                  السعر
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-8 uppercase">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-slate-300 font-bold italic"
                  >
                    جاري تحميل عناصر الشركات...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/40 transition-all border-slate-50 h-[80px] group"
                  >
                    <TableCell className="px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <PackageOpen size={20} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {item.item_ar_name || "غير محدد"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {item.item_en_name || "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-bold text-slate-600 bg-slate-50 rounded-xl px-2 py-1 border-slate-200"
                        >
                          {item.companies?.company_name || "بدون شركة"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-emerald-50 text-emerald-600 text-[10px] border-none font-bold rounded-full px-3 py-1 shadow-none">
                        {item.typeofitems?.item_type || "عام"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="text-slate-600 font-black tabular-nums">
                        {item.price} $
                      </span>
                    </TableCell>
                    <TableCell className="px-8 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-slate-400 font-bold"
                  >
                    لا توجد عناصر مطابقة.
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
