"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  PackageSearch,
  Link as LinkIcon,
  Box,
  Tag,
  LayoutGrid,
  BarChart2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/app/lib/utils";
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

export default function CompanyItemsPage() {
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialAddState = {
    item_ar_name: "",
    item_en_name: "",
    company_name: "",
    item_type: "",
    unit: "1",
    price: 0,
    weight: 0,
    package: "",
    packet_weight: 0,
    date_exp: "",
    GTIP: "",
    image: "",
    manufacturer_code: "",
    ismain_item: true,
    main_item: "",
    isActive: true,
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState(initialAddState);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(initialAddState);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const [itemsRes, compRes, typesRes, unitsRes] = await Promise.all([
        apiClient.getCompItems(),
        apiClient.getCompanies(),
        apiClient.getTypeofitems(),
        apiClient.getUnits(),
      ]);
      setData(itemsRes || []);
      setCompanies(compRes || []);
      setTypes(typesRes || []);
      setUnits(unitsRes || []);
    } catch (e) {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e?: any) => {
    if (e) e.preventDefault();
    if (!addData.company_name) return toast.error("يجب اختيار الشركة");
    if (!addData.item_ar_name.trim()) return toast.error("يجب إدخال اسم الصنف");
    try {
      let uploadedImageUrl = addData.image;
      if (imageFile) {
        const uploadRes = await apiClient.uploadFile(imageFile);
        if (uploadRes && uploadRes.url) {
          uploadedImageUrl = uploadRes.url;
        }
      }

      await apiClient.createCompItem({ ...addData, image: uploadedImageUrl });
      toast.success("تم إنشاء الصنف وتوليد الأكواد بنجاح");
      setIsAddOpen(false);
      setAddData(initialAddState);
      setImageFile(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      ...item,
      company_name: item.company_name.toString(),
      item_type: item.item_type?.toString() || "",
      unit: item.unit?.toString() || "1",
      main_item: item.main_item?.toString() || "",
      date_exp: item.date_exp
        ? new Date(item.date_exp).toISOString().split("T")[0]
        : "",
      GTIP: item.GTIP || "",
      image: item.image || "",
      manufacturer_code: item.manufacturer_code || "",
    });
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!editData.item_ar_name.trim())
      return toast.error("يجب إدخال اسم الصنف");
    try {
      let uploadedImageUrl = editData.image;
      if (editImageFile) {
        const uploadRes = await apiClient.uploadFile(editImageFile);
        if (uploadRes && uploadRes.url) {
          uploadedImageUrl = uploadRes.url;
        }
      }

      await apiClient.updateCompItem(editData.id, {
        ...editData,
        image: uploadedImageUrl,
      });
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      setEditImageFile(null);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deleteCompItem(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  // filter main items for selected company to show in parent item list
  const availableMainItems = data.filter(
    (item) =>
      item.company_name.toString() === addData.company_name &&
      item.ismain_item === true,
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PackageSearch className="text-primary" /> إدارة الأصناف والمنتجات
        </h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary rounded-xl px-6">
              <Plus size={16} /> إضافة صنف جديد
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold border-b pb-4">
                إضافة صنف جديد للشركة
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-2">
              {/* Company & Type */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="font-bold text-blue-800">
                    الشركة الموردة *
                  </Label>
                  <select
                    value={addData.company_name}
                    onChange={(e) =>
                      setAddData({ ...addData, company_name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">-- اختر الشركة --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="font-bold text-blue-800">
                    نوع الصنف (لتوليد الكود)
                  </Label>
                  <select
                    value={addData.item_type}
                    onChange={(e) =>
                      setAddData({ ...addData, item_type: e.target.value })
                    }
                    className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">-- اختر النوع --</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.item_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم الصنف (عربي) *</Label>
                  <Input
                    value={addData.item_ar_name}
                    onChange={(e) =>
                      setAddData({ ...addData, item_ar_name: e.target.value })
                    }
                    className="rounded-xl"
                    placeholder="عصير مانجو..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">اسم الصنف (أجنبي)</Label>
                  <Input
                    value={addData.item_en_name}
                    onChange={(e) =>
                      setAddData({ ...addData, item_en_name: e.target.value })
                    }
                    className="rounded-xl text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">كود المنتج (المصنع)</Label>
                  <Input
                    value={addData.manufacturer_code}
                    onChange={(e) =>
                      setAddData({ ...addData, manufacturer_code: e.target.value })
                    }
                    className="rounded-xl"
                    placeholder="Ref Code..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">السعر</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={addData.price}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">تاريخ الصلاحية</Label>
                  <Input
                    type="date"
                    value={addData.date_exp}
                    onChange={(e) =>
                      setAddData({ ...addData, date_exp: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Parent/Child status */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ismain"
                    checked={addData.ismain_item}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        ismain_item: e.target.checked,
                        main_item: "",
                      })
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <Label
                    htmlFor="ismain"
                    className="font-bold cursor-pointer text-emerald-900"
                  >
                    صنف أساسي (رئيسي)
                  </Label>
                </div>

                {!addData.ismain_item && (
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2 text-emerald-800">
                      <LinkIcon size={14} /> هذا الصنف نكهة/فرع تابع للمنتج
                      الأساسي:
                    </Label>
                    <select
                      value={addData.main_item}
                      onChange={(e) =>
                        setAddData({ ...addData, main_item: e.target.value })
                      }
                      className="flex h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">-- اختر المنتج الأساسي --</option>
                      {availableMainItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.item_ar_name}
                        </option>
                      ))}
                    </select>
                    {availableMainItems.length === 0 &&
                      addData.company_name && (
                        <p className="text-xs text-rose-500">
                          لا يوجد منتجات رئيسية لهذه الشركة بعد.
                        </p>
                      )}
                  </div>
                )}
              </div>

              {/* Logistic details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">الوحدة</Label>
                  <select
                    value={addData.unit}
                    onChange={(e) =>
                      setAddData({ ...addData, unit: e.target.value })
                    }
                    className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.unit_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">التعبئة</Label>
                  <Input
                    value={addData.package}
                    onChange={(e) =>
                      setAddData({ ...addData, package: e.target.value })
                    }
                    className="rounded-xl"
                    placeholder="6x24"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الوزن</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={addData.weight}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الوزن القائم</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={addData.packet_weight}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        packet_weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">رمز التعرفة (GTIP)</Label>
                  <Input
                    type="number"
                    value={addData.GTIP}
                    onChange={(e) =>
                      setAddData({ ...addData, GTIP: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">صورة المنتج</Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl mt-4"
              >
                حفظ وتوليد الأكواد آلياً
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b pb-4">
              تعديل بيانات الصنف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">تسلسل داخلي</p>
                <p className="font-mono font-bold text-sm text-emerald-700">
                  {editData.internal_code}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">الكود المركب</p>
                <p className="font-mono font-bold text-sm text-indigo-700">
                  {editData.composite_code || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الصنف (عربي)</Label>
                <Input
                  value={editData.item_ar_name}
                  onChange={(e) =>
                    setEditData({ ...editData, item_ar_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">اسم الصنف (أجنبي)</Label>
                <Input
                  value={editData.item_en_name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, item_en_name: e.target.value })
                  }
                  className="rounded-xl text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">كود المنتج (المصنع)</Label>
                <Input
                  value={editData.manufacturer_code}
                  onChange={(e) =>
                    setEditData({ ...editData, manufacturer_code: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">السعر</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.price || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">تاريخ الصلاحية</Label>
                <Input
                  type="date"
                  value={editData.date_exp || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, date_exp: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">التعبئة</Label>
                <Input
                  value={editData.package || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, package: e.target.value })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الوزن</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.weight || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الوزن القائم</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.packet_weight || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      packet_weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رمز التعرفة (GTIP)</Label>
                <Input
                  type="number"
                  value={editData.GTIP || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, GTIP: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">تحديث صورة المنتج</Label>
              <Input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                className="rounded-xl"
              />
              {editData.image && !editImageFile && (
                <p className="text-xs text-slate-500 mt-1">
                  المنتج يمتلك صورة حالياً، ارفع ملف جديد لتغييرها.
                </p>
              )}
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
                الصنف مفعل
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ProductStatCard
          title="إجمالي الأصناف"
          value={loading ? "..." : data.length.toString()}
          icon={<Box size={20} />}
          color="blue"
        />
        <ProductStatCard
          title="متوفر حالياً"
          value={
            loading
              ? "..."
              : data.filter((item: any) => item.isActive).length.toString()
          }
          icon={<Tag size={20} />}
          color="amber"
          detail="أصناف نشطة"
        />
        <ProductStatCard
          title="فئات المنتجات"
          value={loading ? "..." : types.length.toString()}
          icon={<LayoutGrid size={20} />}
          color="emerald"
          detail="تصنيفات النظام"
        />
        <ProductStatCard
          title="الشركات المتعاونة"
          value={loading ? "..." : companies.length.toString()}
          icon={<BarChart2 size={20} />}
          color="rose"
          detail="ملاك البضائع"
        />
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الشركة
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الكود المركب
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    تسلسل داخلي
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    رقم الصنف
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الصورة
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الاسم (عربي)
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الاسم (أجنبي)
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    كود المصنع
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    النوع
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الوحدة
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    التعبئة
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الوزن
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الوزن القائم
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    السعر
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    صلاحية
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    GTIP
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    المرجع (الأب)
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    أساسي/فرعي
                  </TableHead>
                  <TableHead className="text-right font-bold py-4 whitespace-nowrap">
                    الحالة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    إجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={20}
                      className="text-center py-8 text-slate-500"
                    >
                      لا توجد أصناف
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item: any) => (
                    <TableRow
                      key={item.id}
                      className={!item.ismain_item ? "bg-slate-50/30" : ""}
                    >
                      <TableCell className="font-bold text-blue-900 whitespace-nowrap">
                        {item.companies?.company_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="font-mono text-sm bg-indigo-50 border-indigo-200 text-indigo-700"
                        >
                          {item.composite_code || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-emerald-700 whitespace-nowrap">
                        {item.internal_code}
                      </TableCell>
                      <TableCell className="font-mono text-slate-700 whitespace-nowrap">
                        {item.item_code}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.image ? (
                          <div className="w-10 h-10 mx-auto rounded overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                            <Image
                              src={item.image}
                              alt={item.item_ar_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 mx-auto rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 whitespace-nowrap">
                        {item.item_ar_name}
                      </TableCell>
                      <TableCell
                        className="text-gray-700 whitespace-nowrap"
                        dir="ltr"
                      >
                        {item.item_en_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-blue-600 whitespace-nowrap">
                        {item.manufacturer_code || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {item.typeofitems?.item_type || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {item.units?.unit_name || "—"}
                      </TableCell>
                      <TableCell
                        className="font-mono text-gray-600 whitespace-nowrap"
                        dir="ltr"
                      >
                        {item.package || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-gray-600 whitespace-nowrap">
                        {item.weight || 0}
                      </TableCell>
                      <TableCell className="font-mono text-gray-600 whitespace-nowrap">
                        {item.packet_weight || 0}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-bold text-emerald-700">
                          {item.price
                            ? `$${parseFloat(item.price).toFixed(2)}`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.date_exp
                          ? new Date(item.date_exp).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-indigo-600 whitespace-nowrap">
                        {item.GTIP || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {!item.ismain_item && item.parent_item ? (
                          <span className="text-slate-600 flex items-center gap-1">
                            <LinkIcon size={12} />{" "}
                            {item.parent_item.item_ar_name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.ismain_item ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            أساسي
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-slate-600">
                            فرعي (نكهة)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            غير فعال
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:bg-blue-50 h-8 w-8"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-rose-500 hover:bg-rose-50 h-8 w-8"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductStatCard({ title, value, icon, color, detail }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="flex flex-col">
        <span className="text-slate-400 text-[10px] font-black mb-1.5 uppercase tracking-widest leading-none">
          {title}
        </span>
        <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {detail && (
          <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            {detail}
          </span>
        )}
      </div>
      <div
        className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
          colorMap[color],
        )}
      >
        {icon}
      </div>
    </div>
  );
}
